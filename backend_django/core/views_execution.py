from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Question, TestCase, Submission, Room
from django.shortcuts import get_object_or_404
import json
import time
import traceback

class ExecuteCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        question_id = request.data.get('questionId')
        
        if not code:
            return Response({'error': 'Code is required'}, status=400)
        
        # Get test cases
        test_cases = []
        if question_id:
            question = get_object_or_404(Question, id=question_id)
            test_cases = TestCase.objects.filter(question=question, is_hidden=False)
        else:
            # Use provided test cases
            test_cases_data = request.data.get('testCases', [])
            test_cases = [{'input_data': tc.get('input'), 'expected_output': tc.get('expected')} for tc in test_cases_data]
        
        results = []
        passed_count = 0
        total_count = len(test_cases) if isinstance(test_cases, list) else test_cases.count()
        
        # Execute code against test cases
        if not test_cases:
            # Single run mode (no test cases)
            result = self._execute_code(code, language, '')
            results.append({
                'input': '',
                'expected': '',
                'actual': result['output'],
                'passed': True,
                'runtime': result['runtime'],
                'error': result.get('error')
            })
            passed_count = 1 if not result.get('error') else 0
            total_count = 1
        else:
            for tc in test_cases:
                if hasattr(tc, 'input_data'):
                    input_data = tc.input_data
                    expected = tc.expected_output
                else:
                    input_data = tc['input_data']
                    expected = tc['expected_output']
                
                result = self._execute_code(code, language, input_data)
                
                passed = str(result['output']).strip() == str(expected).strip()
                if passed:
                    passed_count += 1
                
                results.append({
                    'input': input_data,
                    'expected': expected,
                    'actual': result['output'],
                    'passed': passed,
                    'runtime': result['runtime'],
                    'error': result.get('error')
                })
        
        # Determine overall status
        if passed_count == total_count:
            overall_status = 'Accepted'
        elif passed_count > 0:
            overall_status = 'Wrong Answer'
        else:
            overall_status = 'Error' if any(r.get('error') for r in results) else 'Wrong Answer'
        
        return Response({
            'results': results,
            'passed': passed_count,
            'total': total_count,
            'status': overall_status
        })

    def _execute_code(self, code, language, input_data):
        import subprocess
        import tempfile
        import os

        # Timeout in seconds
        TIMEOUT = 5

        try:
            if language == 'python':
                # Create a temporary python file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
                    f.write(code)
                    temp_path = f.name
                
                try:
                    # Run the python script
                    process = subprocess.run(
                        ['python', temp_path],
                        input=str(input_data) if input_data else '',
                        text=True,
                        capture_output=True,
                        timeout=TIMEOUT
                    )
                    runtime = 0 
                    return {
                        'output': process.stdout,
                        'error': process.stderr,
                        'runtime': runtime
                    }
                finally:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

            elif language == 'javascript':
                with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
                    f.write(code)
                    temp_path = f.name
                
                try:
                    process = subprocess.run(
                        ['node', temp_path],
                        input=str(input_data) if input_data else '',
                        text=True,
                        capture_output=True,
                        timeout=TIMEOUT
                    )
                    return {
                        'output': process.stdout,
                        'error': process.stderr,
                        'runtime': 0
                    }
                finally:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

            elif language == 'c':
                # Create temporary C file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False, encoding='utf-8') as f:
                    f.write(code)
                    c_path = f.name
                    # Output executable path (remove .c and add .exe for Windows or nothing for Linux)
                    # For safety, we explicitly use a new temp name for exe
                    exe_path = c_path[:-2] + '.exe'
                
                try:
                    # Compile
                    compile_process = subprocess.run(
                        ['gcc', c_path, '-o', exe_path],
                        capture_output=True,
                        text=True
                    )
                    
                    if compile_process.returncode != 0:
                        return {
                            'output': '',
                            'error': f"Compilation Error:\n{compile_process.stderr}",
                            'runtime': 0
                        }
                    
                    # Execute
                    run_process = subprocess.run(
                        [exe_path],
                        input=str(input_data) if input_data else '',
                        text=True,
                        capture_output=True,
                        timeout=TIMEOUT
                    )
                    
                    return {
                        'output': run_process.stdout,
                        'error': run_process.stderr,
                        'runtime': 0
                    }
                finally:
                    if os.path.exists(c_path):
                        os.remove(c_path)
                    if os.path.exists(exe_path):
                        os.remove(exe_path)

            else:
                return {'output': '', 'error': f'Language {language} not supported', 'runtime': 0}

        except subprocess.TimeoutExpired:
            return {'output': '', 'error': 'Execution timed out', 'runtime': TIMEOUT * 1000}
        except Exception as e:
            return {'output': '', 'error': f'System Error: {str(e)}', 'runtime': 0}

    def _unused_js_to_python(self):
        pass


from .utils.firebase_client import get_firestore_client

class SubmitSolutionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        room_id = request.data.get('roomId')
        
        # Validate room details via Firestore
        db = get_firestore_client()
        if not db:
            return Response({'error': 'Database unavailable'}, status=503)
            
        doc = db.collection('rooms').document(room_id).get()
        if not doc.exists:
             return Response({'error': 'Room not found'}, status=404)

        # Get all test cases (including hidden)
        test_cases = TestCase.objects.filter(question=question)
        
        # Execute against all test cases
        executor = ExecuteCodeView()
        results = []
        passed_count = 0
        
        for tc in test_cases:
            result = executor._execute_code(code, language, tc.input_data)
            passed = str(result['output']).strip() == str(tc.expected_output).strip()
            if passed:
                passed_count += 1
            results.append(result)
        
        total_count = test_cases.count()
        
        # Determine status
        if passed_count == total_count:
            submission_status = 'Accepted'
        else:
            submission_status = 'Wrong Answer'
        
        # Create submission record (room is optional/None now)
        submission = Submission.objects.create(
            user=request.user if request.user.is_authenticated else None,
            question=question,
            room=None, # Bypass SQL Room relation
            code=code,
            language=language,
            status=submission_status,
            passed_tests=passed_count,
            total_tests=total_count
        )
        
        return Response({
            'submissionId': submission.id,
            'status': submission_status,
            'passed': passed_count,
            'total': total_count
        })
