from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.indexRoute , name="index"),
    path('login', view=views.loginRoute , name="login"),
    path('register', view=views.registerRoute , name="register"),
    path('logout', view=views.logoutRoute , name="logout"),

    path('detail/<int:id>',view=views.detailRoute , name="detail"),
    path('createCourse', view=views.createCourseRoute , name='createCourse'),
    path('editCourse/<int:id>', view=views.editCourseRoute , name='editCourse'),
    path('myCourse', view=views.myCourseRoute , name='myCourse'),
    path('savedCourse',view=views.mySavedRoute , name="savedCourse"),

    # Rest APIs
    path('deleteCourse/<int:id>', view=views.deleteCourseRoute ,name='deleteCourse'),
    path('enroll/<int:id>', view=views.enrollCourseRoute , name="enrollCourse"),
    path('search',view=views.searchRoute , name='search'),
    path('saveUnsaveCourse',view=views.saveUnsaveCourse ,name="saveUnsave")
]