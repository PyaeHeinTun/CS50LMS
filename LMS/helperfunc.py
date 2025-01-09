from .models import Course, User
from django.http.response import HttpResponse
from django.shortcuts import render

def authenticate_with_email(email,password) -> User:
    try:
        user = User.objects.get(email=email)
        if (user.check_password(password)):
            return user
        return None
    except Exception as e:
        return None
    
def check_to_create_user_is_exist(email) -> bool:
    try:
        user = User.objects.filter(email=email)
        if (len(user) == 0):
            return True
        return False
    except Exception as e:
        return False
    
def getCourseofOwnerOrRenderError(request,id) -> Course:
    try:
        existing_course = Course.objects.get(creator=request.user,id=id)
        return existing_course
    except:
        return None
    