from django.shortcuts import render,redirect,resolve_url
from django.contrib.auth import login,logout
from django.core.handlers.wsgi import WSGIRequest
from django.http.response import HttpResponse,HttpResponseRedirect,JsonResponse
from .models import User,Chapter,Course,Lecture,Quiz,SavedCourse,StudentCourseProgress
from django.templatetags.static import static
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
import json
from django.db.models.query import QuerySet
from django.db.models import Count,Sum
from .helperfunc import check_to_create_user_is_exist,authenticate_with_email,getCourseofOwnerOrRenderError

# Create your views here.
def indexRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    
    role = request.user.role
    context = {}
    if (role == "Teacher"):
        myCourseList = Course.objects.filter(creator=request.user).order_by("-updatedAt")
        myCourseList = myCourseList.annotate(total_students=Count('enrolledStudents'))
        myPopularCourse = myCourseList.order_by("-total_students")
        myPopularCourse = myPopularCourse.annotate(total_chapter=Count('chapter'))
        total_student = myCourseList.aggregate(total_students_sum=Sum('total_students'))['total_students_sum']

        context={
            "my_courses" : myCourseList,
            "total_student" : total_student,
            "popular_courses" : [course.serialize() for course in myPopularCourse],
            "my_course_count" : len(myCourseList)
        }
        return render(request,template_name='LMS/index.html',context=context)
    else:
        allCourseList = Course.objects.all().order_by("-updatedAt")
        allCourseList = allCourseList.annotate(total_students=Count('enrolledStudents'))
        myPopularCourse = allCourseList.order_by("-total_students")
        myPopularCourse = myPopularCourse.annotate(total_chapter=Count('chapter'))[:5]
        # Add isEnrolled in every popular course
        myPopularCourse_update:list[Course] = []
        for course in myPopularCourse.all():
            course.isEnrolled = course.enrolledStudents.contains(request.user)
            myPopularCourse_update.append(course)
        myCourseList = Course.objects.filter(enrolledStudents=request.user)
        savedCourseCount = SavedCourse.objects.filter(savedUser=request.user)
        context= {
            "my_courses" : myCourseList,
            "saved_course_count" : len(savedCourseCount),
            "popular_courses" : [course.serialize() for course in myPopularCourse_update],
            "my_course_count" : len(myCourseList),
        }
    
    return render(request,template_name='LMS/index.html',context=context)

@csrf_exempt
def searchRoute(request:WSGIRequest) -> JsonResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    
    if request.method=="POST":
        try:
            limit = 3
            pageNumber = int(request.POST.get("pageNumber",1))
            searchCourseQuery = request.POST.get("query","")
            if searchCourseQuery=="all":
                foundCourseList = Course.objects.all()
            else:
                foundCourseList = Course.objects.filter(title__contains=searchCourseQuery)
            
            foundCourseListUpdate = []
            for course in foundCourseList:
                course.isEnrolled = course.enrolledStudents.contains(request.user)
                foundCourseListUpdate.append(course)
            foundCourseListUpdate = [course.serialize() for course in foundCourseListUpdate]
            foundCourseListUpdate = Paginator(foundCourseListUpdate,limit)
            return JsonResponse({
                "message" : "Successfully fetched mycourse list.",
                "myCourseList" : foundCourseListUpdate.page(pageNumber).object_list,
                "pageNumber" : pageNumber,
                "hasNext" : foundCourseListUpdate.page(pageNumber).has_next(),
                "hasPrevious" : foundCourseListUpdate.page(pageNumber).has_previous(),
                "totalPageNumber" : foundCourseListUpdate.num_pages, 
            },status=200)
        except:
            return JsonResponse({
                "message": "Error finding courses"
            },status=404)
    
    return render(request=request,template_name='LMS/search.html')

@csrf_exempt
def saveUnsaveCourse(request:WSGIRequest) -> JsonResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    
    if request.method == "POST":
        try:
            courseId = request.POST.get("courseId","")
            existingCourse = Course.objects.get(id=courseId)
            existingSaved = SavedCourse.objects.filter(savedUser=request.user,savedCourse=existingCourse)
            operationType = None
            if (len(existingSaved) != 0):
                # Remove Saved
                existingSaved[0].delete()
                operationType = "unsave"
            else:
                # Add Saved
                saveCourse = SavedCourse(
                    savedUser = request.user,
                    savedCourse = existingCourse,
                )
                saveCourse.save()
                operationType = "save"
            return JsonResponse({
                "message" : f"Successfully {operationType}d",
                "type" : operationType,
            },status=200)
        except:
            return JsonResponse({
                "message" : "Error Occured",
            },status=404)
    return JsonResponse({
        "message" : "Method not allowed",
    },status=404)

@csrf_exempt
def enrollCourseRoute(request:WSGIRequest,id:int) -> JsonResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    
    if request.method == "POST":
        try:
            existingCourse = Course.objects.get(id=id)
            existingCourse.enrolledStudents.add(request.user)
            return JsonResponse({
            "message" : "Successfully Enrolled",
        },status=200)
        except:
            return JsonResponse({
            "message" : "Error Cannot enroll.",
        },status=404)
        
    return JsonResponse({
        "message" : "Only POST method is allowed",
    },status=404)

def loginRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("index")
    if request.method == "POST":
        email = request.POST.get("emailX","")
        password = request.POST.get("passwordX","")
        if (email=="") | (password==""):
            return JsonResponse({
                "message" : "Your data contains empty value!",
            },status=404)
        user = authenticate_with_email(email,password)
        if user is None:
            return JsonResponse({
                "message" : "Your email or password could not find.",
            },status=404)
        login(request,user)
        return redirect("index")
        
    return render(request,template_name='LMS/login.html')

def registerRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("index")
    if (request.method == "POST"):
        userName = request.POST.get("usernameX","")
        email = request.POST.get("emailX","")
        password = request.POST.get("passwordX","")
        role = request.POST.get("role","")
        imagePath = static('LMS/img/avatar.png')
        if (userName=="") | (email=="") | (password=="") | (role==""):
            return JsonResponse({
                "message" : "Your data contains empty value!",
            },status=404)
        
        if check_to_create_user_is_exist(email) != True:
            return JsonResponse({
                "message" : "User already exist with this mail."
            },status=404)
        user = User.objects.create_user(
            username=userName,
            email=email,
            password=password,
            profile_img=imagePath,
            profile_img=imagePath,
            role=role,
        )
        login(request,user)
        return JsonResponse({
            "message" : "Successfully created User"
        },status=200)
    return render(request,template_name='LMS/register.html')

def logoutRoute(request:WSGIRequest) -> HttpResponse:
    logout(request)
    return redirect("login")

def detailRoute(request:WSGIRequest,id:int) -> HttpResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    try:
        existingCourse = Course.objects.get(id=id)
        isOwner = existingCourse.creator == request.user
        isAlreadyBuy = existingCourse.enrolledStudents.contains(request.user)
        isSaved = len(SavedCourse.objects.filter(savedUser=request.user,savedCourse=existingCourse)) != 0

        lectureList:list[QuerySet] = [chapter.lectures.all() for chapter in existingCourse.chapter.all()]
        flattened_data:list[Lecture] = []
        for queryset in lectureList:
            flattened_data.extend(queryset)
        lectureList = [lecture.serialize() for lecture in flattened_data]

        return render(request,template_name='LMS/course_details.html',context={
            "course" : existingCourse.serialize(),
            "lectureList": json.dumps(lectureList),
            "isOwner" : isOwner,
            "isAlreadyBuy" : isAlreadyBuy,
            "isSaved" : isSaved,
        })
    except:
        return render(request,template_name='LMS/error.html',context={
            "error" : {
                "code" : "404",
                "message" : "Not Found Course",
            }
        })
    
def createCourseRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated == False:
        return redirect("login")
    if request.method=="POST":
        title=request.POST.get("title","")
        description=request.POST.get("description","")
        price=request.POST.get("price","")
        image=request.FILES.get("image",None)
        if (title=="")|(description=="")|(price=="")|(image==None):
            return JsonResponse({
                "message" : "Your Data Contains Empty Value."
            },status=302)
        newCourse = Course(
            creator=request.user,
            course_img=image,
            title = title,
            description = description,
            price = price,
        )
        newCourse.save()
        return JsonResponse({
            "message" : "Successfuly saved course.",
            "course" : newCourse.serialize(),
        },status=200)
    return render(request,template_name='LMS/create_course.html')

def editCourseRoute(request:WSGIRequest,id:int) -> HttpResponse:
    if request.user.is_authenticated != True:
        return redirect("login")
    
    if request.method=="POST":
        title=request.POST.get("title","")
        description=request.POST.get("description","")
        price=request.POST.get("price","")
        editType=request.POST.get("editType",None)
        videoUrl = request.POST.get("videoUrl","")
        videoDuration = request.POST.get("videoDuration","")
        chapterId = request.POST.get("chapterId","")
        quizList = request.POST.get("quizList",None)
        
        if (editType=="course"):
            if (title=="")|(description=="")|(price=="")|(editType==None):
                return JsonResponse({
                    "message" : "Your Data Contains Empty Value."
                },status=302)
            try:
                existing_course = getCourseofOwnerOrRenderError(request,id)
                existing_course.title = title
                existing_course.description = description
                existing_course.price = price
                existing_course.save()
                
                return JsonResponse({
                    "message" : "Successfully Saved Course",
                    "editType" : editType,
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Cannot perform this operation",
                },status=302)
        if (editType=="chapter"):
            if (title==""):
                return JsonResponse({
                    "message" : "Your Data Contains Empty Value."
                },status=302)

            try:
                existing_course = getCourseofOwnerOrRenderError(request,id)
                chapter = Chapter(
                    creator = request.user,
                    title = title,
                    isLocked = False,
                    isVisible = True,
                )
                chapter.save()
                existing_course.chapter.add(chapter)
                existing_course.save()
                return JsonResponse({
                    "message" : "Successfully Saved Course",
                    "chapter" : chapter.serialize(),
                    "editType" : editType,
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Cannot perform this operation"
                },status=302)
        if (editType=="lecture"):
            if (title=="") |(description=="")|(videoUrl=="")|(videoDuration=="")|(chapterId==""):
                return JsonResponse({
                    "message" : "Your Data Contains Empty Value."
                },status=302)
            try:
                existing_course = getCourseofOwnerOrRenderError(request,id)
                existing_chapter:Chapter = existing_course.chapter.all().get(id=chapterId)
                lecture = Lecture(
                    title = title,
                    description = description,
                    videoUrl = videoUrl,
                    lectureType = "video",
                    videoDuration = videoDuration,
                )
                lecture.save()
                existing_course.totalVideoDuration = int(existing_course.totalVideoDuration)+int(videoDuration)
                existing_course.save()
                existing_chapter.lectures.add(lecture)
                existing_chapter.save()
                return JsonResponse({
                    "message" : "Successfully Saved Lecture",
                    "lecture" : lecture.serialize(),
                    "lectureType" : "video",
                    "editType" : "lecture",
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Cannot perform this operation"
                },status=302)
        if (editType=="quiz"):
            try:
                existing_course = getCourseofOwnerOrRenderError(request,id)
                existing_chapter:Chapter = existing_course.chapter.all().get(id=chapterId)
                quizList:list = json.loads(quizList)
                newlecture = Lecture(
                    title="Quiz",
                    lectureType = "quiz",
                )
                newlecture.save()
                for i in range(len(quizList)):
                    newQuiz = Quiz(
                        question= quizList[i]['question'],
                        choices= json.dumps(quizList[i]['answers']),
                        answer= quizList[i]['answers'][quizList[i]['correctAnswer']],
                    )
                    newQuiz.save()
                    newlecture.quiz.add(newQuiz)
                newlecture.save()
                existing_chapter.lectures.add(newlecture)
                existing_chapter.save()
                return JsonResponse({
                    "message" : "Successfully added quiz.",
                    "editType" : "quiz",
                    "lecture" : newlecture.serialize(),
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Cannot add quiz to database."
                },status=404)
        return JsonResponse({
            "message" : "Your form contains invalid editType."
        },status=302)
    
    existing_course = getCourseofOwnerOrRenderError(request,id)
    if existing_course==None:
        return render(request,template_name='LMS/error.html',context={
            "error" : {
                "code" : "404",
                "message" : "Not Found Course",
            }
        })
    return render(request,template_name='LMS/edit_course.html',context={
        "course" : existing_course.serialize(),
    }) 

@csrf_exempt
def deleteCourseRoute(request:WSGIRequest,id:int) -> JsonResponse:
    if request.user.is_authenticated != True:
        return JsonResponse({
            "message" : "User must be logged in.",
        },status=302)
    
    if request.method == "POST":
        deleteType = request.POST.get("deleteType",None)
        courseId = request.POST.get("courseId",None)
        if (deleteType==None):
            return JsonResponse({
                "message" : "Cannot delete without having deleteType.",
            },status=404)

        if deleteType=="course":
            try:
                existingCourse = Course.objects.get(id=courseId)
                existingCourse.delete()
                return JsonResponse({
                    "message" : "Successfully deleted",
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Could not delete",
                },status=404)
        if deleteType=="chapter":
            try:
                chapterId = request.POST.get("chapterId",None)
                existingCourse = Course.objects.get(creator=request.user,id=id)
                chapter = Chapter.objects.get(id=chapterId,creator=request.user)
                existingCourse.chapter.remove(chapter)
                chapter.delete()
                return JsonResponse({
                    "message" : "Successfully Removed Chapter",
                },status=200)
            except:
                return JsonResponse({
                    "message" : "Chapter could not be found on server.",
                },status=404)

        if deleteType=="lecture":
            pass
        return JsonResponse({
            "message" : "Successfully deleted chapter."
        },status=200)

    return JsonResponse({
        "message" : "Method not allowed!."
    },status=403)

@csrf_exempt
def myCourseRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated == False:
        return redirect("login")
    if request.user.role == "Teacher":
        myCourseList = [course.serialize() for course in Course.objects.filter(creator=request.user)]
    else:
        myCourseList = [course.serialize() for course in Course.objects.filter(enrolledStudents=request.user)]
    myCourseList = Paginator(myCourseList,3)
    if request.method == "POST":
        try:
            pageNumber = int(request.POST.get("pageNumber",1))
            return JsonResponse({
                "message" : "Successfully fetched mycourse list.",
                "myCourseList" : myCourseList.page(pageNumber).object_list,
                "pageNumber" : pageNumber,
                "hasNext" : myCourseList.page(pageNumber).has_next(),
                "hasPrevious" : myCourseList.page(pageNumber).has_previous(),
                "totalPageNumber" : myCourseList.num_pages, 
            },status=200)
        except:
            return JsonResponse({
                "message" : "Something went wrong",
            },status=404)
    
    return render(request,template_name='LMS/my_course.html',context={
        "myCourseList" : myCourseList.page(1).object_list,
        "pageNumber" : 1,
        "hasNext" : myCourseList.page(1).has_next(),
        "hasPrevious" : myCourseList.page(1).has_previous(),
        "totalPageNumber" : myCourseList.num_pages, 
    })


@csrf_exempt
def mySavedRoute(request:WSGIRequest) -> HttpResponse:
    if request.user.is_authenticated == False:
        return redirect("login")
    
    mySavedCourseList = [course.savedCourse.serialize() for course in SavedCourse.objects.filter(savedUser=request.user)]
    mySavedCourseList = Paginator(mySavedCourseList,3)
    if request.method == "POST":
        try:
            pageNumber = int(request.POST.get("pageNumber",1))
            return JsonResponse({
                "message" : "Successfully fetched mycourse list.",
                "myCourseList" : mySavedCourseList.page(pageNumber).object_list,
                "pageNumber" : pageNumber,
                "hasNext" : mySavedCourseList.page(pageNumber).has_next(),
                "hasPrevious" : mySavedCourseList.page(pageNumber).has_previous(),
                "totalPageNumber" : mySavedCourseList.num_pages, 
            },status=200)
        except:
            return JsonResponse({
                "message" : "Something went wrong",
            },status=404)
    
    return render(request,template_name='LMS/savedCourse.html',context={
        "myCourseList" : mySavedCourseList.page(1).object_list,
        "pageNumber" : 1,
        "hasNext" : mySavedCourseList.page(1).has_next(),
        "hasPrevious" : mySavedCourseList.page(1).has_previous(),
        "totalPageNumber" : mySavedCourseList.num_pages, 
    })