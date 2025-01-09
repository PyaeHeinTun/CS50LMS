from django.db import models
from django.contrib.auth.models import AbstractUser
from django.templatetags.static import static
import os
import json

class User(AbstractUser):
    ROLES = (
        ('Student', 'Student'),
        ('Teacher', 'Teacher'),
    )

    profile_img = models.ImageField(upload_to="static/profiles",null=True)
    role = models.CharField(max_length=50,choices=ROLES,null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.username

    def serialize(self) -> dict:
        try:
            if (os.path.isfile(self.profile_img.path)):
                return {
                    "id" : self.id,
                    "username" : self.username,
                    "email" : self.email,
                    "profile_img" : static(self.profile_img.url),
                    "role" : self.role,
                }
        except:
            return {
                "id" : self.id,
                "username" : self.username,
                "email" : self.email,
                "profile_img" : static("/network/img/avatar.png"),
                "role" : self.role
            }

class Quiz(models.Model):
    question = models.TextField()
    choices = models.TextField()
    answer = models.TextField()
    isVisible = models.BooleanField(default=True)

    def get_choices(self) -> list:
        return json.loads(self.choices)
    
    def set_choices(self,list:list):
        self.choices = json.dumps(list)

    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "question" : self.question,
            "choices" : self.get_choices(),
            "answer" : self.answer,
            "isVisible" : self.isVisible,
        }
    def __str__(self) -> str:
        return self.question

class Lecture(models.Model):
    title = models.CharField(max_length=150,null=True)
    description = models.TextField(null=True)
    videoUrl = models.CharField(max_length=200,null=True)
    lectureType = models.CharField(max_length=100,null=False)
    videoDuration = models.IntegerField(null=True)
    views = models.IntegerField(default=0)
    isLocked = models.BooleanField(default=False)
    quiz = models.ManyToManyField(Quiz,related_name="quiz")
    isVisible = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "title" : self.title,
            "description" : self.description,
            "videoUrl" : self.videoUrl,
            "lectureType" : self.lectureType,
            "videoDuration" : self.videoDuration,
            "views" : self.views,
            "isLocked" : self.isLocked,
            "quiz" : [quiz_data.serialize() for quiz_data in self.quiz.all()],
            "isVisible" : self.isVisible,
            "createdAt" : self.createdAt.isoformat(),
            "updatedAt" : self.updatedAt.isoformat(),
        }
    
    def __str__(self) -> str:
        return self.title
        
class Chapter(models.Model):
    creator = models.ForeignKey(User,related_name="courseCreator",on_delete=models.CASCADE)
    title = models.CharField(max_length=150)
    isLocked = models.BooleanField(default=False)
    lectures = models.ManyToManyField(Lecture,related_name="lectures")
    isVisible = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "creator" : self.creator.serialize(),
            "title" : self.title,
            "isLocked" : self.isLocked,
            "lectures" : [lecture.serialize() for lecture in self.lectures.all()],
            "isVisible" : self.isVisible,
            "createdAt" : self.createdAt.isoformat(),
            "updatedAt" : self.updatedAt.isoformat(),
        }
    
    def __str__(self) -> str:
        return self.title

class Course(models.Model):
    creator = models.ForeignKey(User,related_name="creator",on_delete=models.CASCADE)
    course_img = models.ImageField(upload_to="static/courses",null=False)
    title = models.TextField()
    description = models.TextField()
    chapter = models.ManyToManyField(Chapter,name="chapter")
    price = models.IntegerField()
    totalVideoDuration = models.IntegerField(default=0)
    enrolledStudents = models.ManyToManyField(User,name="enrolledStudents")
    isVisible = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "creator" : self.creator.serialize(),
            "course_img" : self.course_img.url,
            "title" : self.title,
            "description" : self.description,
            "chapter" : [cha.serialize() for cha in self.chapter.all()],
            "price" : self.price,
            # Must shown in hours , it is stored as minutes
            "totalVideoDuration" : round(self.totalVideoDuration/60),
            "enrolledStudents" : [student.serialize() for student in self.enrolledStudents.all()],
            "isVisible" : self.isVisible,
            "createdAt" : self.createdAt.isoformat(),
            "updatedAt" : self.updatedAt.isoformat(),
            "isEnrolled" : self.isEnrolled if hasattr(self,'isEnrolled') else False,
        }
    
    def __str__(self) -> str:
        return self.title

class SavedCourse(models.Model):
    savedUser = models.ForeignKey(User,related_name="savedUser",on_delete=models.CASCADE)
    savedCourse = models.ForeignKey(Course,related_name="savedCourse",on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "savedUser" : self.savedUser.serialize(),
            "savedCourse" : self.savedCourse.serialize(),
            "createdAt" : self.createdAt.isoformat(),
            "updatedAt" : self.updatedAt.isoformat(),
        }
    
    def __str__(self) -> str:
        return f"{self.savedUser.username} {self.savedCourse.title}"
    
class TeacherCourse(models.Model):
    courseList = models.ManyToManyField(Course,name="courseList")
    totalStudent = models.ManyToManyField(User,name="studentList")

    def serialize(self) -> dict:
        return {
            "id" : self.id,
            "courseList" : self.courseList,
            "totalStudent" : self.totalStudent,
        }

class StudentCourseProgress(models.Model):
    course = models.ForeignKey(Course,related_name="courseProgress",on_delete=models.CASCADE)
    studentUser = models.ForeignKey(User,related_name="studentUser",on_delete=models.CASCADE)
    completeProgress = models.IntegerField()

    def serialize(self) -> dict:
        return {
            "course" : self.course.serialize(),
            "studentUser" : self.studentUser.serialize(),
            "completeProgress" : self.completeProgress,
        }