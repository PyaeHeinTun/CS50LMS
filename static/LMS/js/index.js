import { makeRequest } from "./component/makeRequest.js";
import { setUpPaginationIndex } from "./component/pagination.js";
import { makeToast } from "./component/toast.js";

document.addEventListener("DOMContentLoaded",function () {
    setUpPaginationIndex()
})

export function clickEnrollButton(courseId) {
    var formData = new FormData()
    formData.append("enrollType","enroll")
    makeRequest(`/enroll/${courseId}`,"POST",formData).then(response=>{
        makeToast("Success",response['message'])
        // Change Enroll Now Btn to Go To Course BTN
        setUpPaginationIndex()
        document.getElementById("my_course_count").innerText = parseInt(document.getElementById("my_course_count").innerText) + 1
        document.getElementById(`btnSection_${courseId}`).querySelector("button").onclick = `window.location.href = '/detail/${courseId}}'`
        document.getElementById(`btnSection_${courseId}`).querySelector("button").innerText = "Go To Course"
    })
}

window.clickEnrollButton = clickEnrollButton