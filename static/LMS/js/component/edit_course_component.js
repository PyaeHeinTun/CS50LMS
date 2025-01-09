import { arrangeChapterNumber } from "./courseForm.js"
import { makeRequest } from "./makeRequest.js"
import { makeToast } from "./toast.js"

export function addNewChapterToDom(chapter) {
    var chapterNumber = document.getElementById("chapter_list").childElementCount+1
    var chapter_template = `
        <div class="bg-white border rounded-lg shadow-sm chapterSection_">
            <!-- Section Header -->
            <div class="flex justify-between items-center p-4 border-b bg-gray-100">
                <div class="flex items-center space-x-2">
                    <span class="font-semibold text-gray-700 text-sm md:text-base">
                        Chapter : ${chapterNumber}
                    </span>
                    <span class="text-gray-500 text-sm md:text-base">${chapter['title']}</span>
                </div>
                <div>
                    <button id="deleteChapter_${chapter['id']}"
                        class="bg-blue-500 text-white text-xs md:text-sm px-3 py-1 rounded hover:bg-blue-600">
                        - Delete Chapter
                    </button>
                </div>
            </div>
        </div>
    `

    var domParser = new DOMParser().parseFromString(chapter_template,"text/html")

    var newChapter = document.createElement("div")
    newChapter.id = `chapterSection_${chapter['id']}`
    newChapter.className = "bg-white border rounded-lg shadow-sm mb-6 chapterSection_"
    newChapter.innerHTML = domParser.body.innerHTML
    document.getElementById("chapter_list").append(newChapter)

    var deleteBtn = `deleteChapter_${chapter['id']}`
    document.getElementById(deleteBtn).addEventListener("click",function (_) {
    var el = document.getElementById(deleteBtn)
    // Make Request to delete from server
    var urlSplitter = window.location.pathname.split("/")
    var courseId = urlSplitter.at(urlSplitter.length-1)
    var chapterId = el.id.split("_")[1]
    var formData = new FormData()
    formData.append("chapterId",chapterId)
    formData.append("deleteType","chapter")
    makeRequest(`/deleteCourse/${courseId}`,"POST",formData).then(jsonResponse=>{
        // Remove Chapter Element From UI
        makeToast("Success",jsonResponse['message'])
        document.getElementById(`chapterSection_${chapterId}`).remove()
        arrangeChapterNumber()
    })
    })
}

export function addNewLectureToDom(lecture) {
    var chapterEl = document.getElementById("chapter_list").lastElementChild
    var chapterElId = chapterEl.id
    var lectureNumber = chapterEl.childElementCount
    var lecture_template_video = `
        <div class="flex items-center space-x-2">
            <span class="text-gray-700 text-sm md:text-base font-medium">
                Lecture ${lectureNumber}:
            </span>
            <span class="text-gray-600 text-sm md:text-base">
                ${lecture['title']}
            </span>
        </div>
        <!-- Drag Handle -->
        <div class="">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4B77D1"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/></svg>
        </div>
    `

    var lecture_template_quiz = `
        <div class="flex items-center space-x-2">
            <span class="text-gray-700 text-sm md:text-base font-medium">
                Lecture ${lectureNumber}:
            </span>
            <span class="text-gray-600 text-sm md:text-base">
                ${lecture['title']}
            </span>
        </div>
        <!-- Drag Handle -->
        <div class="">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                fill="#4B77D1">
                <path
                    d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
            </svg>        
        </div>
    `

    if (lecture['lectureType']=="video"){
        var domParser = new DOMParser().parseFromString(lecture_template_video,"text/html")
    }else{
        var domParser = new DOMParser().parseFromString(lecture_template_quiz,"text/html")
    }

    var newlecture = document.createElement("div")
    newlecture.className = "p-4 flex justify-between items-center"
    newlecture.innerHTML = domParser.body.innerHTML
    chapterEl.append(newlecture)
}