import { makeRequest } from "./component/makeRequest.js";
import { setUpPaginationSearch } from "./component/pagination.js"
import { makeToast } from "./component/toast.js";

document.addEventListener("DOMContentLoaded",function () {
    setUpPaginationSearch()
})

export function clickEnrollButton(courseId) {
    var formData = new FormData()
    formData.append("enrollType","enroll")
    makeRequest(`/enroll/${courseId}`,"POST",formData).then(response=>{
        makeToast("Success",response['message'])
        // Change Enroll Now Btn to Go To Course BTN
        setUpPaginationSearch()
    })
}

window.clickEnrollButton = clickEnrollButton