from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from db.mongodb import mongodb
from bson import ObjectId
import json
from datetime import datetime

# --- Problems API ---

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_problems(request):
    """Get all problems from MongoDB"""
    try:
        if not mongodb or not mongodb.problems:
             return Response({'error': 'Database unavailable'}, status=503)

        problems = list(mongodb.problems.find({}))
        
        # Convert ObjectId to string for JSON serialization
        for problem in problems:
            problem['_id'] = str(problem['_id'])
        
        return Response(problems, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_problem(request, problem_id):
    """Get single problem by ID"""
    try:
        if not mongodb or not mongodb.problems:
             return Response({'error': 'Database unavailable'}, status=503)

        # Try to find by custom id field first
        problem = mongodb.problems.find_one({'id': problem_id})
        
        # If not found, try by _id (ObjectId)
        if not problem:
            try:
                problem = mongodb.problems.find_one({'_id': ObjectId(problem_id)})
            except:
                pass
        
        if not problem:
            return Response(
                {'error': 'Problem not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Convert ObjectId to string
        problem['_id'] = str(problem['_id'])
        
        return Response(problem, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated]) # Protected
def create_problem(request):
    """Create a new problem"""
    try:
        if not mongodb or not mongodb.problems:
             return Response({'error': 'Database unavailable'}, status=503)
             
        data = request.data
        result = mongodb.problems.insert_one(data)
        
        return Response(
            {
                'message': 'Problem created successfully',
                'id': str(result.inserted_id)
            }, 
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# --- Existing / Legacy Adapters (if needed) ---
# Keeping the existing functions but routing them through the new singleton if possible,
# or just defining new ones as clean replacements.
# The user asked to "Update API endpoints".
# I'll replace the old `get_questions` with a redirection or just keep it as a legacy alias if used elsewhere.

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def mongo_get_questions(request):
    return get_problems(request)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_quiz_result(request):
    """Save quiz result to MongoDB"""
    try:
        if not mongodb:
             return Response({'error': 'Database unavailable'}, status=503)

        data = request.data
        
        result_doc = {
            'userId': data.get('userId'),
            'score': data.get('score'),
            'category': data.get('category'),
            'answers': data.get('answers', []),
            'completedAt': datetime.utcnow()
        }
        
        result = mongodb.db['quiz_results'].insert_one(result_doc)
        
        return Response({
            'status': 'success',
            'resultId': str(result.inserted_id)
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)
