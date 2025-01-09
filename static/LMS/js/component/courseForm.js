import { makeRequest } from "./makeRequest.js"
import { makeToast } from "./toast.js"
import { addQuiz } from "./quiz.js"
import {showModalPopup,closeListenerForAddFormModalPopupOutside} from "./modal_popup.js"

export function courseFormSubmitListen() {
    document.getElementById("courseForm").addEventListener("submit",function(event){
        event.preventDefault()
        var formData = new FormData(this)
        makeRequest("createCourse","POST",formData).then(jsonResponse=>{
            makeToast("Success",jsonResponse['message'])
            window.location.href = `/editCourse/${jsonResponse['course']['id']}`
        })
    })
}

export function courseEditFormSubmitListen() {
    document.getElementById("courseForm").addEventListener("submit",function(event){
        event.preventDefault()
        var formData = new FormData(this)
        formData.append("editType","course")
        makeRequest(`/editCourse/${formData.get('courseId')}`,"POST",formData).then(jsonResponse=>{
            makeToast("Success",jsonResponse['message'])
        })
    })
}

export function addChapterBtnListenerForPopup() {
    closeListenerForAddFormModalPopupOutside()
    document.getElementById("addChapterBtn").addEventListener("click",function () {
        var form_template = `
            <h2 class="text-lg font-medium text-gray-700 mb-4">Add Chapter</h2>
            <div class="mb-4">
                <input type="text" name="editType"
                    class="hidden mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="" value="chapter">
                <label for="sectionTitle" class="block text-sm font-medium text-gray-700">Chapter Title</label>
                <input type="text" id="sectionTitle" name="title"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="">
            </div>
        `
        var domParser = new DOMParser().parseFromString(form_template,"text/html")
        showModalPopup(domParser)
    })
}

export function deleteChapterBtnListener() {
    document.querySelectorAll(".chapterSection_").forEach(el=>{

        var urlSplitter = window.location.pathname.split("/")
        var courseId = urlSplitter.at(urlSplitter.length-1)
        var chapterId = el.id.split("_")[1]

        var deleteBtn = document.getElementById(`deleteChapter_${chapterId}`)
        deleteBtn.addEventListener("click",function listenerFunctionForDeleteChapterBtn(_) {
        // Make Request to delete from server
        var formData = new FormData()
        formData.append("chapterId",chapterId)
        formData.append("deleteType","chapter")
        makeRequest(`/deleteCourse/${courseId}`,"POST",formData).then(jsonResponse=>{
            // Remove Chapter Element From UI
            makeToast("Success",jsonResponse['message'])
            document.getElementById(`chapterSection_${chapterId}`).remove()
            arrangeChapterNumber()
        })
        // Arrange Chapter Number
    })
    })
}

export function arrangeChapterNumber() {
    var chapterNumber = 1
    document.querySelectorAll(".chapterSection_").forEach(el=>{
        el.querySelector("span").innerText =  `Chapter : ${chapterNumber}`
        chapterNumber += 1
    })
}


export function addLectureBtnListenerForPopup() {
    closeListenerForAddFormModalPopupOutside()
    try {
        var chapterId = document.getElementById("chapter_list").lastElementChild.id.split("_")[1]
    } catch (error) {
    }
    document.getElementById("addLectureBtn").addEventListener("click",function () {
        var form_template = `
            <h2 class="text-lg font-medium text-gray-700 mb-4">Add Lecture</h2>
            <div class="mb-4">
                <input type="text" name="chapterId" class="hidden" value="${chapterId}">
                <input type="text" name="editType"
                    class="hidden mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="" value="lecture">
                <label class="block text-sm font-medium text-gray-700">Lecture Title</label>
                <input type="text" name="title"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="">

                <label class="block text-sm font-medium text-gray-700">Lecture Description</label>
                <textarea type="text" name="description"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required=""></textarea>


                <label class="block text-sm font-medium text-gray-700">Video URL</label>
                <input type="text" name="videoUrl"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="">

                <label class="block text-sm font-medium text-gray-700">Video Duration(min)</label>
                <input type="number" name="videoDuration"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="">
            </div>
        `
        var domParser = new DOMParser().parseFromString(form_template,"text/html")
        showModalPopup(domParser)
    })
}

export function addQuizBtnListenerForPopup() {
    closeListenerForAddFormModalPopupOutside()
    try {
        var chapterId = document.getElementById("chapter_list").lastElementChild.id.split("_")[1]
    } catch (error) {
    }
    document.getElementById("addQuizBtn").addEventListener("click",function () {
        var form_template = `
            <input type="text" name="chapterId" class="hidden" value="${chapterId}">
            <input type="text" name="editType"
                    class="hidden mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required="" value="quiz">
            <!-- Question Input -->
                <div>
                    <label for="question" class="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input type="text" id="question" name="question"
                        class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter your question here" required />
                </div>

                <!-- Answer Choices -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Answers</label>
                    <div id="answers" class="space-y-4">
                        <!-- Answer 1 -->
                        <div class="grid grid-cols-6 gap-4">
                            <input type="radio" name="correctAnswer" value="0"
                                class="col-span-1 text-blue-600 focus:ring-blue-500" required />
                            <input type="text" name="answer" placeholder="Answer 1"
                                class="col-span-5 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required />
                        </div>

                        <!-- Answer 2 -->
                        <div class="grid grid-cols-6 gap-4">
                            <input type="radio" name="correctAnswer" value="1"
                                class="col-span-1 text-blue-600 focus:ring-blue-500" required />
                            <input type="text" name="answer" placeholder="Answer 2"
                                class="col-span-5 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required />
                        </div>
                    </div>

                    <!-- Add Answer Button -->
                    <button type="button" id="addAnswerBtn" class="mt-2 text-sm text-blue-600 hover:underline">+ Add
                        Answer</button>
                </div>

                <!-- Add Question Button -->
                <div class="flex flex-wrap justify-between items-center gap-4 mb-5">
                    <button type="button" id="addQuestionBtn"
                        class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Add Question
                    </button>
                </div>
        `
        var domParser = new DOMParser().parseFromString(form_template,"text/html")
        showModalPopup(domParser)
        addQuiz()
    })
}