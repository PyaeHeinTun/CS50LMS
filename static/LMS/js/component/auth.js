import { makeToast } from "./toast.js"

let request_url

export function login() {
    request_url = "/login"
    var submitForm = document.getElementById("submitForm")
    submitForm.removeEventListener("submit",submitFormImplementation)
    submitForm.addEventListener("submit",submitFormImplementation) 
}

export function register() {
    request_url = "/register"
    var submitForm = document.getElementById("submitForm")
    submitForm.removeEventListener("submit",submitFormImplementation)
    submitForm.addEventListener("submit",submitFormImplementation) 
}

function submitFormImplementation(event) {
    event.preventDefault()
    var isOkayResponse = false
    const formData = new FormData(this)
    fetch(request_url,{
        "method":"post",
        "body": formData,
    }).then(response=>{
        isOkayResponse = response.ok
        if (isOkayResponse == false){
            return response.json()
        }
    }).then(data=>{
        if (isOkayResponse == false){
            makeToast("Error",data['message'])
        }else{
            window.location.replace("/")
        }
    })
}