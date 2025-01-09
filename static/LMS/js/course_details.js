import { renderQuiz } from "./component/quiz.js"
import { makeToast } from "./component/toast.js"
import { makeRequest } from "./component/makeRequest.js"

document.addEventListener("DOMContentLoaded",function () {
    document.querySelectorAll(".toogle-btn").forEach(btn=>{
        btn.addEventListener("click",function (_) {
            var isOpen = btn.querySelector("svg").classList.contains("active")
            if (isOpen){
                // Close
                btn.querySelector("svg").classList.remove("active")
                btn.querySelector("svg").classList.add("inactive")
                btn.nextElementSibling.classList.remove("shownContent")
                btn.nextElementSibling.classList.add("unshownContent")
            }else{
                // Close All Other shownContent
                document.querySelectorAll(".toogle-btn").forEach(btnSec=>{
                    btnSec.querySelector("svg").classList.remove("active")
                    btnSec.querySelector("svg").classList.add("inactive")
                    btnSec.nextElementSibling.classList.remove("shownContent")
                    btnSec.nextElementSibling.classList.add("unshownContent")
                })
                
                // Open
                btn.querySelector("svg").classList.add("active")
                btn.querySelector("svg").classList.remove("inactive")
                btn.nextElementSibling.classList.add("shownContent")
                btn.nextElementSibling.classList.remove("unshownContent")
            }
        })
    })
    
    document.querySelector(".shownContent").firstElementChild.click()

    // Listener for save and enroll
    document.getElementById("saveCourseBtn").addEventListener("click",function () {
        var formData = new FormData()
        formData.append("courseId",window.location.pathname.split("/")[2])
        makeRequest("/saveUnsaveCourse","POST",formData).then(response=>{
            makeToast("Success",response['message'])
            // Update UI
            if (response['type']=='save'){
                document.getElementById("saveCourseBtn").innerText = "Unsave"
            }else{
                document.getElementById("saveCourseBtn").innerText = "Save"
            }
        })
    })

    document.getElementById("enrollCourseBtn").addEventListener("click",function () {
        var courseId = window.location.pathname.split("/")[2]
        var formData = new FormData()
        makeRequest(`/enroll/${courseId}`,"POST",formData).then(response=>{
            makeToast("Success",response['message'])

            // Update UI
            document.getElementById("enrollCourseBtn").classList.add("hidden")
            document.getElementById("saveCourseBtn").classList.remove("col-span-1")
            document.getElementById("saveCourseBtn").classList.add("col-span-2")
        })
    })
})

export function changeLectureContent(lectureList, lectureId) {
    var lecture = lectureList.filter((value, index) => value.id == lectureId);
    lecture = lecture[0]
    console.log(lecture)

    if (lecture['lectureType'] == 'video'){
        renderLectureVideo(lecture)
    }
    else{
        renderLectureQuiz(lecture)
    }

}

function renderLectureVideo(lecture) {
    var video_template = `
        <div class="">
            <!-- Video Section -->
            <div class="relative">
                <video class="w-full" width="320" height="240" controls>
                <source src="${lecture['videoUrl']}" type="video/mp4">
                Your browser does not support the video tag.
                </video>
            </div>

            <!-- Description -->
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-2">${lecture['title']}</h2>
                <pre class="text-gray-700" style=" white-space: pre-wrap;">${lecture['description']}</pre>
            </div>
        </div>
    `
    var parser = new DOMParser().parseFromString(video_template,"text/html")
    var renderLectureContent = document.getElementById("renderLectureContent")
    var childNumberInRenderLecture = renderLectureContent.childElementCount
    for (let index = 0; index < childNumberInRenderLecture; index++) {
        renderLectureContent.lastElementChild.remove()
    }
    renderLectureContent.append(parser.body)
}

function renderLectureQuiz(lecture) {
    var quiz_template = `
        <div id="quiz-container" class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <!-- Quiz Header -->
            <div class="text-center mb-4">
                <h1 class="text-xl font-bold text-gray-800">Quiz App</h1>
                <p id="question-counter" class="text-sm text-gray-600">Question 1 of 3</p>
            </div>

            <!-- Quiz Question -->
            <div>
                <h2 id="question" class="text-lg font-semibold text-gray-700 mb-4">What is the capital of
                    France?</h2>
                <ul id="answers" class="space-y-2">
                    <!-- Options will be dynamically rendered here -->
                </ul>
            </div>

            <!-- Next Button -->
            <div class="mt-6 flex justify-between">
                <button id="next-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hidden">Next</button>
            </div>

            <!-- Score Display (Initially Hidden) -->
            <div id="score-container" class="hidden text-center">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                <p id="score" class="text-lg text-gray-700"></p>
                <button id="restart-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg mt-4">Restart
                    Quiz</button>
            </div>
        </div>
    `

    var parser = new DOMParser().parseFromString(quiz_template,"text/html")
    var renderLectureContent = document.getElementById("renderLectureContent")
    var childNumberInRenderLecture = renderLectureContent.childElementCount
    for (let index = 0; index < childNumberInRenderLecture; index++) {
        renderLectureContent.lastElementChild.remove()
    }
    renderLectureContent.append(parser.body)
    renderQuiz(lecture['quiz'])
}

// Expose the function to the global scope (window object)
window.changeLectureContent = changeLectureContent;