import { courseFormSubmitListen } from "./component/courseForm.js"
import { addChapterBtnListenerForPopup ,deleteChapterBtnListener } from "./component/courseForm.js"
import { addLectureBtnListenerForPopup , addQuizBtnListenerForPopup } from "./component/courseForm.js"


document.addEventListener("DOMContentLoaded",function(){
    // Course Form Submit
    courseFormSubmitListen()
})