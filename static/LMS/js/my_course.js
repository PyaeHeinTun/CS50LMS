import { makeRequest } from "./component/makeRequest.js"
import { setUpPaginationMyCourse } from "./component/pagination.js"
import { makeToast } from "./component/toast.js"

document.addEventListener("DOMContentLoaded",function () {
    setUpPaginationMyCourse()
})