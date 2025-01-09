import { makeRequest } from "./makeRequest.js";
import { makeToast } from "./toast.js";

export function setUpPaginationIndex(){
    var renderDataList = []

    const rowsPerPage = 3; // Number of rows per page
    let totoalPage = 0;
    let currentPage = 1;

    const tableBody = document.getElementById("tableBody");
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    function getCoursesFromNetwork(pageNumber=1) {
        renderDataList = []
        var formData = new FormData()
        formData.append("pageNumber",pageNumber)
        makeRequest("/myCourse","POST",formData).then(response=>{
            renderDataList = response['myCourseList']
            totoalPage = response['totalPageNumber']
            renderData()
        })
    }

    // Render rows based on the current page
    function renderData() {
        tableBody.innerHTML = ""; // Clear existing rows

        for (let i =0; i < renderDataList.length; i++) {
            const row = document.createElement("tr");
            row.addEventListener("click",function (event) {
                window.location.href=`/detail/${renderDataList[i].id}`
            })
            row.innerHTML = `
                <td class="p-2 md:p-3">${renderDataList[i].title}</td>
                <td class="p-2 md:p-3">${renderDataList[i].chapter.length}</td>
                <td class="p-2 md:p-3">${renderDataList[i].totalVideoDuration}</td>
            `;
            tableBody.appendChild(row);
        }

        // Update pagination info
        paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totoalPage / rowsPerPage)}`;

        // Enable/disable pagination buttons
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === Math.ceil(totoalPage / rowsPerPage);
    }

    // Pagination controls
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getCoursesFromNetwork(currentPage)
        }
    });

    nextPage.addEventListener("click", () => {
        if (currentPage < Math.ceil(totoalPage / rowsPerPage)) {
            currentPage++;
            getCoursesFromNetwork(currentPage)
        }
    });

    // Initial render
    getCoursesFromNetwork(1)
}

export function setUpPaginationMyCourse(){
    var renderDataList = []

    const rowsPerPage = 1; // Number of rows per page
    let totoalPage = 0;
    let currentPage = 1;

    const renderCourse = document.getElementById("renderCourse")
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    function getCoursesFromNetwork(pageNumber=1) {
        renderDataList = []
        var formData = new FormData()
        formData.append("pageNumber",pageNumber)
        makeRequest("/myCourse","POST",formData).then(response=>{
            renderDataList = response['myCourseList']
            totoalPage = response['totalPageNumber']
            renderData()
            listenForDeleteBtn()
        })
    }

    function listenForDeleteBtn() {
        document.querySelectorAll(".courseCard").forEach(courseCard=>{
            var courseId = courseCard.querySelectorAll("a")[1].id.split("_")[1]
            document.getElementById(courseCard.querySelectorAll("a")[1].id).addEventListener("click",function () {
                var formData = new FormData()
                formData.append("courseId",courseId)
                formData.append("deleteType","course")
                makeRequest(`/deleteCourse/${courseId}`,"POST",formData).then(response=>{
                    makeToast("Success","Successfully deleted course.")
                    courseCard.remove()
                })

            })
        })
    }

    // Render rows based on the current page
    function renderData() {
        document.querySelectorAll(".courseCard").forEach(el=>{el.remove()})
        for (let index = 0; index < renderDataList.length; index++) {
            const element = renderDataList[index];
            var courseTemplate = `
                <!-- Course Card -->
                <div onclick="window.location.href='/detail/${element['id']}'" class="bg-white rounded-lg shadow overflow-hidden md:w-45 lg:45 flex-shrink-0 courseCard">
                    <img src="${element['course_img']}" alt="${element['title']}" class="w-full h-32 md:h-36 object-cover" />
                    <div class="p-4">
                        <h4 class="h-12 font-semibold text-sm md:text-lg mb-1">${element['title']}</h4>
                        <p class="text-xs md:text-sm text-gray-500 mb-2">${element['chapter'].length} Chapter •
                            ${element['totalVideoDuration']} Hours</p>
                        <div class="flex justify-between items-center">
                            <span class="text-indigo-600 font-bold text-sm md:text-base">$ ${element['price']}</span>
                            ${role === "Teacher" 
                            ? `<a href="/editCourse/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Edit Course
                            </a>`
                            : `<a href="/detail/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Go Detail
                            </a>`
                            }
                        </div>

                        ${role == "Teacher" ?
                        `<div class="flex justify-between items-center mt-2">
                            <a id="deleteCourse_${element['id']}"
                                class="bg-red-600 text-white w-full px-2 md:px-3 py-1 rounded-md text-center text-xs md:text-sm">
                                Delete Course
                            </a>
                        </div>` : `<div class="hidden"></div>`
                        }
                    </div>
                </div>
            `
            var parser = new DOMParser().parseFromString(courseTemplate,"text/html")
            renderCourse.appendChild(parser.body.firstChild)
        }

        // Update pagination info
        paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totoalPage / rowsPerPage)}`;

        // Enable/disable pagination buttons
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === Math.ceil(totoalPage / rowsPerPage);
    }

    // Pagination controls
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getCoursesFromNetwork(currentPage)
        }
    });

    nextPage.addEventListener("click", () => {
        if (currentPage < Math.ceil(totoalPage / rowsPerPage)) {
            currentPage++;
            getCoursesFromNetwork(currentPage)
        }
    });

    // Initial render
    getCoursesFromNetwork(1)
}

export function setUpPaginationSearch(){
    var renderDataList = []

    const rowsPerPage = 1; // Number of rows per page
    let totoalPage = 0;
    let currentPage = 1;

    const renderCourse = document.getElementById("renderCourse")
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    function getCoursesFromNetwork(pageNumber=1) {
        renderDataList = []
        var formData = new FormData()
        formData.append("pageNumber",pageNumber)
        const urlParams = new URLSearchParams(window.location.search)
        var queryString = urlParams.get("query")
        if (queryString==null){
            formData.append("query","all")
        }else{
            formData.append("query",queryString)
        }
        makeRequest("/search","POST",formData).then(response=>{
            renderDataList = response['myCourseList']
            totoalPage = response['totalPageNumber']
            renderData()
        })
    }

    // Render rows based on the current page
    function renderData() {
        document.querySelectorAll(".courseCard").forEach(el=>{el.remove()})
        for (let index = 0; index < renderDataList.length; index++) {
            const element = renderDataList[index];
            var courseTemplate = `
                <!-- Course Card -->
                <div onclick="window.location.href='/detail/${element['id']}'" class="bg-white rounded-lg shadow overflow-hidden md:w-45 lg:45 flex-shrink-0 courseCard">
                    <img src="${element['course_img']}" alt="${element['title']}" class="w-full h-32 md:h-36 object-cover" />
                    <div class="p-4">
                        <h4 class="h-12 font-semibold text-sm md:text-lg mb-1">${element['title']}</h4>
                        <p class="text-xs md:text-sm text-gray-500 mb-2">${element['chapter'].length} Chapter •
                            ${element['totalVideoDuration']} Hours</p>
                        <div class="flex justify-between items-center">
                            <span class="text-indigo-600 font-bold text-sm md:text-base">$ ${element['price']}</span>
                            ${role === "Teacher" 
                            ? `<a href="/editCourse/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Edit Course
                            </a>`
                            : element["isEnrolled"] ? `<a href="/detail/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Go Detail
                            </a>` : `<button onclick="event.stopPropagation();clickEnrollButton(${element['id']})"
                                class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Enroll Now
                            </button>`
                            }
                        </div>

                        ${role == "Teacher" ?
                        `<div class="flex justify-between items-center mt-2">
                            <a id="deleteCourse_${element['id']}"
                                class="bg-red-600 text-white w-full px-2 md:px-3 py-1 rounded-md text-center text-xs md:text-sm">
                                Delete Course
                            </a>
                        </div>` : `<div class="hidden"></div>`
                        }
                    </div>
                </div>
            `
            var parser = new DOMParser().parseFromString(courseTemplate,"text/html")
            renderCourse.appendChild(parser.body.firstChild)
        }

        // Update pagination info
        paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totoalPage / rowsPerPage)}`;

        // Enable/disable pagination buttons
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === Math.ceil(totoalPage / rowsPerPage);
    }

    // Pagination controls
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getCoursesFromNetwork(currentPage)
        }
    });

    nextPage.addEventListener("click", () => {
        if (currentPage < Math.ceil(totoalPage / rowsPerPage)) {
            currentPage++;
            getCoursesFromNetwork(currentPage)
        }
    });

    // Initial render
    getCoursesFromNetwork(1)
}


export function setUpPaginationSavedCourse(){
    var renderDataList = []

    const rowsPerPage = 1; // Number of rows per page
    let totoalPage = 0;
    let currentPage = 1;

    const renderCourse = document.getElementById("renderCourse")
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    function getCoursesFromNetwork(pageNumber=1) {
        renderDataList = []
        var formData = new FormData()
        formData.append("pageNumber",pageNumber)
        makeRequest("/savedCourse","POST",formData).then(response=>{
            renderDataList = response['myCourseList']
            totoalPage = response['totalPageNumber']
            renderData()
            listenForDeleteBtn()
        })
    }

    function listenForDeleteBtn() {
        document.querySelectorAll(".courseCard").forEach(courseCard=>{
            var courseId = courseCard.querySelectorAll("a")[1].id.split("_")[1]
            document.getElementById(courseCard.querySelectorAll("a")[1].id).addEventListener("click",function () {
                var formData = new FormData()
                formData.append("courseId",courseId)
                formData.append("deleteType","course")
                makeRequest(`/deleteCourse/${courseId}`,"POST",formData).then(response=>{
                    makeToast("Success","Successfully deleted course.")
                    courseCard.remove()
                })

            })
        })
    }

    // Render rows based on the current page
    function renderData() {
        document.querySelectorAll(".courseCard").forEach(el=>{el.remove()})
        for (let index = 0; index < renderDataList.length; index++) {
            const element = renderDataList[index];
            var courseTemplate = `
                <!-- Course Card -->
                <div onclick="window.location.href='/detail/${element['id']}'" class="bg-white rounded-lg shadow overflow-hidden md:w-45 lg:45 flex-shrink-0 courseCard">
                    <img src="${element['course_img']}" alt="${element['title']}" class="w-full h-32 md:h-36 object-cover" />
                    <div class="p-4">
                        <h4 class="h-12 font-semibold text-sm md:text-lg mb-1">${element['title']}</h4>
                        <p class="text-xs md:text-sm text-gray-500 mb-2">${element['chapter'].length} Chapter •
                            ${element['totalVideoDuration']} Hours</p>
                        <div class="flex justify-between items-center">
                            <span class="text-indigo-600 font-bold text-sm md:text-base">$ ${element['price']}</span>
                            ${role === "Teacher" 
                            ? `<a href="/editCourse/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Edit Course
                            </a>`
                            : `<a href="/detail/${element['id']}" class="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm">
                                Go Detail
                            </a>`
                            }
                        </div>

                        ${role == "Teacher" ?
                        `<div class="flex justify-between items-center mt-2">
                            <a id="deleteCourse_${element['id']}"
                                class="bg-red-600 text-white w-full px-2 md:px-3 py-1 rounded-md text-center text-xs md:text-sm">
                                Delete Course
                            </a>
                        </div>` : `<div class="hidden"></div>`
                        }
                    </div>
                </div>
            `
            var parser = new DOMParser().parseFromString(courseTemplate,"text/html")
            renderCourse.appendChild(parser.body.firstChild)
        }

        // Update pagination info
        paginationInfo.textContent = `Page ${currentPage} of ${Math.ceil(totoalPage / rowsPerPage)}`;

        // Enable/disable pagination buttons
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === Math.ceil(totoalPage / rowsPerPage);
    }

    // Pagination controls
    prevPage.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            getCoursesFromNetwork(currentPage)
        }
    });

    nextPage.addEventListener("click", () => {
        if (currentPage < Math.ceil(totoalPage / rowsPerPage)) {
            currentPage++;
            getCoursesFromNetwork(currentPage)
        }
    });

    // Initial render
    getCoursesFromNetwork(1)
}