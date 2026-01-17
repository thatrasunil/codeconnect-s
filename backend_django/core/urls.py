
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    SignupView, CreateRoomView, RoomDetailView, UserProfileView,
    DashboardStatsView, MyRoomsView, FileUploadView,
    RoomMetadataView, RoomLanguageView, RoomCodeView, RootView,
    RoomMessageView, TypingStatusView, RoomTypingView, LeaderboardView, HeartbeatView, RoomParticipantsView,
    AIChatView, AIExplainView, AIInterviewView, QuizListView, QuizDetailView, QuizSubmitView
)
from .views_interview import QuestionListView, InterviewSessionView, InterviewHistoryView
from .views_execution import ExecuteCodeView, SubmitSolutionView
from .views_roles import AssignRoleView, RoomPermissionsView, RoomParticipantsRolesView
from .views_mongodb import (
    get_problems, get_problem, create_problem,
    mongo_get_questions, save_quiz_result as mongo_save_quiz_result
)

urlpatterns = [
    path('api/leaderboard', LeaderboardView.as_view(), name='leaderboard'),
    path('', RootView.as_view(), name='root'),

    # Auth
    path('api/auth/signup', SignupView.as_view(), name='signup'),
    path('api/auth/login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me', UserProfileView.as_view(), name='user_profile'),
    
    # Dashboard
    path('api/dashboard/stats', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/rooms/my-rooms', MyRoomsView.as_view(), name='my_rooms'),
    path('api/rooms/<str:room_id>/metadata/', RoomMetadataView.as_view(), name='room_metadata'),
    path('api/rooms/<str:room_id>/language/', RoomLanguageView.as_view(), name='room_language'),
    path('api/rooms/<str:room_id>/code/', RoomCodeView.as_view(), name='room_code'),
    path('api/upload', FileUploadView.as_view(), name='file_upload'),
    
    # AI
    path('api/ai/chat', AIChatView.as_view(), name='ai_chat'),
    path('api/ai/explain', AIExplainView.as_view(), name='ai_explain'),
    path('api/ai/interview', AIInterviewView.as_view(), name='ai_interview'),

    # Rooms
    path('api/create-room', CreateRoomView.as_view(), name='create-room'),
    path('api/rooms/<str:room_id>/', RoomDetailView.as_view(), name='room-detail'),
    path('api/rooms/<str:room_id>/messages', RoomMessageView.as_view(), name='room-messages'),
    path('api/rooms/<str:room_id>/typing', TypingStatusView.as_view(), name='room-typing-status'),
    path('api/rooms/<str:room_id>/typing/active', RoomTypingView.as_view(), name='room-typing-active'),
    path('api/rooms/<str:room_id>/heartbeat', HeartbeatView.as_view(), name='room-heartbeat'),
    path('api/rooms/<str:room_id>/participants', RoomParticipantsView.as_view(), name='room-participants'),
    
    # Interview Features
    path('api/questions', QuestionListView.as_view(), name='question-list'),
    path('api/rooms/<str:room_id>/session', InterviewSessionView.as_view(), name='interview-session'),
    path('api/dashboard/interviews', InterviewHistoryView.as_view(), name='dashboard-interviews'),
    
    # Code Execution
    path('api/execute', ExecuteCodeView.as_view(), name='execute-code'),
    path('api/questions/<str:question_id>/submit', SubmitSolutionView.as_view(), name='submit-solution'),
    
    # Role Management
    path('api/rooms/<str:room_id>/assign-role', AssignRoleView.as_view(), name='assign-role'),
    path('api/rooms/<str:room_id>/permissions', RoomPermissionsView.as_view(), name='room-permissions'),
    path('api/rooms/<str:room_id>/participants-roles', RoomParticipantsRolesView.as_view(), name='participants-roles'),
    # Quizzes
    path('api/quizzes', QuizListView.as_view(), name='quiz-list'),
    path('api/quizzes/<str:id>', QuizDetailView.as_view(), name='quiz-detail'),
    path('api/quizzes/<str:quiz_id>/submit', QuizSubmitView.as_view(), name='quiz-submit'),
    # MongoDB Routes
    path('api/problems', get_problems, name='get_problems'),
    path('api/problems/create', create_problem, name='create_problem'), # Protected
    path('api/problems/<str:problem_id>', get_problem, name='get_problem'),
    
    path('api/v2/questions', mongo_get_questions, name='mongo_question_list'),
    path('api/v2/quiz/save', mongo_save_quiz_result, name='mongo_save_quiz_result'),

]
