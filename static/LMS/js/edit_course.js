import { courseEditFormSubmitListen ,addChapterBtnListenerForPopup ,deleteChapterBtnListener } from "./component/courseForm.js"

import { addLectureBtnListenerForPopup , addQuizBtnListenerForPopup } from "./component/courseForm.js"

document.addEventListener("DOMContentLoaded",function(){
    // Save To Cloud
    courseEditFormSubmitListen()

    // Delete Chapter
    deleteChapterBtnListener()

    // Add Chapter Pop up
    addChapterBtnListenerForPopup()

    // Add lecture pop up
    addLectureBtnListenerForPopup()

    // Add quiz popup
    addQuizBtnListenerForPopup()
})