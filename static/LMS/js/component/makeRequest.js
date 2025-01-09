import {makeToast} from './toast.js'

export function makeRequest(path,method="GET",data) {
    var isResponseOkay = false
    return fetch(path,{
        method : method,
        body : method=="POST" ? data : null,
    }).then(response=>{
        isResponseOkay = response.ok
        return response.json()
    }).then(jsonResponse=>{
        if (isResponseOkay==false){
            makeToast("Error",jsonResponse['message'])
        }else{
            console.log(jsonResponse)
            return jsonResponse
        }
    })
}