let sa = new SheetsApi();
sa.handleClientLoad();
let lib = "";

function updateSignInStatus(isSignedIn){
    if(isSignedIn){
      console.log("You are Signed In!")
    } else {
        console.log("Need Log In!");
        sa.handleSignInClick();
    }
}

/** This is a function that gets called by sa.handleClientLoad() and sa.handleSignInClick()
 * when the librarian variable gets set. Anything that depends on knowing the currently logged
 * in librarian should be called from within this function.
 */
function loadPage() {
  lib = sa.getLibrarian();
  getVocab();
  getTypes();
  getLibs();
  getProgs();
  addUserInfo();
}
var uplsHeaders = [];
var vocabHeaders = [];
var fields = [];
var objectArray = [];
var librarians = [];
var types = [];
var typeArray = [];
var vocabs = [];
var vocabsArray = [];
var progInfo = [];
var progArray = [];

//DATE
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
var currentDate = year + "-" + month + "-" + day;
console.log(currentDate);
fields[12] = lib;
fields[14] = currentDate;
function getHeaders(){
    sa.getTableHeaders("UPLS").then(response => {
        uplsHeaders = sa.parseTableHeaders(response);
        objectArray[0] = uplsHeaders;
        console.log(uplsHeaders);
        dispHeaders();
    });

}

function dispHeaders() {
    let textField;
    for(let i = 0; i < uplsHeaders.length; i++){
        let headerDiv = document.createElement("div");
        headerDiv.className = "ex1";
        headerDiv.setAttribute("id", "div"+i);
        let txt = document.createTextNode(uplsHeaders[i]);
        if (uplsHeaders[i] == "FROZEN_UPLS_ACCOUNT") { continue;}
        headerDiv.appendChild(txt);

        if(uplsHeaders[i] == "LIBRARIAN"){
            textField = document.createElement("span");
            textField.innerHTML = lib;
            /*textField = document.createElement("input");
            textField.value = lib;*/
        }
        else if(uplsHeaders[i] == "STATUS_IN_PROGRAM"){
            textField = document.createElement("select");
            textField.style.width = "auto";
            console.log(vocabsArray[i]);
            for(let j = 0; j < vocabsArray[i].length; j++) {
                let option = document.createElement("option");
                option.value = vocabsArray[4][j];
                option.text = vocabsArray[4][j];
                textField.appendChild(option);

            }
        }
        else if(uplsHeaders[i] == "PROGRAM_DESCRIPTION") {
            textField = document.createElement("select");
            textField.style.width = "250px";
            let option = document.createElement("option");
            option.value = "---";
            option.text = "---";
            option.selected = "true";
            option.disabled = "true";
            textField.setAttribute("onchange", "setLibrarian()");
            textField.appendChild(option);
            for(let i = 1; i < progArray.length; i++) {
                if(progArray[i] == undefined) {continue;}
                let option = document.createElement("option");
                option.value = progArray[i];
                option.text = progArray[i];
                textField.appendChild(option);
            }
            textField.required = true;

        }
        else if(uplsHeaders[i] == "GENERAL_COMMENT") {
            textField = document.createElement("textarea");
        }
        else if(uplsHeaders[i] == "CLASS_LEVEL") {
            textField = document.createElement("input");
            textField.type = "number";
        }
        else if(uplsHeaders[i] == "DATE_ADDED_TO_SYSTEM"){
            /*textField = document.createElement("div");
            let insertDate = document.createTextNode(currentDate);
            textField.appendChild(insertDate);*/
            textField = document.createElement("span");
            textField.innerHTML = currentDate;

        }
        else if(uplsHeaders[i] == "STUDENT_ID"){
            textField = document.createElement("input");
            textField.type = "number";
            textField.required = true;
        }
        else if(uplsHeaders[i]  == "EMAIL"){
            textField = document.createElement("input");
            textField.type = "email";
            textField.required = true;
        }
        else if(i>15 && typeArray[i] == "CheckBox"){
            textField = document.createElement("input");
            textField.type = "checkbox";
        }
        else if(i>15 && typeArray[i] == "Date"){
            textField = document.createElement("input");
            textField.type = "date";
        }
        else if(i>15 && typeArray[i] == "Number"){
            textField = document.createElement("input");
            textField.type = "number";
        }
        else if(i>15 &&  vocabsArray[i] !== undefined){
            textField = document.createElement("select");
            textField.style.width = "auto";
            console.log(vocabsArray[i]);
            for(let j = 0; j < vocabsArray[i].length; j++) {
                let option = document.createElement("option");
                option.value = vocabsArray[i][j];
                option.text = vocabsArray[i][j];
                textField.appendChild(option);
            }
        }
        else {
            textField = document.createElement("input");
        }

        /****ADD SOME VALIDATION TO THIS FOR OTHER FIELDS*/
        textField.setAttribute("id", "field"+i);
        textField.style.cssFloat = "right";

        headerDiv.appendChild(textField);

        document.getElementById("main").appendChild(headerDiv);
        document.getElementById("main").appendChild(document.createElement("br"));
        document.getElementById("main").appendChild(document.createElement("br"));

    }

}


function getData() {
    document.getElementById('field12').value = document.getElementById('field12').innerHTML;
    document.getElementById('field15').value = document.getElementById('field15').innerHTML;

    for(let i = 0; i < uplsHeaders.length; i++) {
        if(i === 13) {continue;}

        fields[i] = document.getElementById("field" + i).value;

        console.log(document.getElementById("field"+i).value);
    }
    objectArray[1] = fields;
    console.log(fields);
    sa.getSheet("UPLS").then(response => {
      var id = document.getElementById("field0").value;
      if (id.length == 0) {
        alert("STUDENT_ID is required.");
      } else {
        var stdnt = sa.selectFromTableWhereConditions(response, ["STUDENT_ID"], [{header:"STUDENT_ID",value: id}], 1);
        var duplicate = (stdnt.length > 1);
        if (duplicate) {
          alert("A student with this ID already exists. Go to the Edit Student or View Student pages to see their existing info.");
        } else {
          var student = confirm("Are you sure you want to add this student?");
          if(student) {
              sendData();
          } else {}
        }
      }
  });
}

function sendData() {
    objectArray = sa.arrayToObjects(objectArray);
    sa.insertIntoTableColValues(uplsHeaders, "UPLS", objectArray).then(response => {
        console.log(sa.parseInsert(response));
        var another = confirm("Student has been added. Click OK to enter another student, or cancel to return to Home page.");
        if (another) {
          window.location.href = "add_student.html";
        } else {
          window.location.href = "main_page.html";
        }
    });

}

function getLibs(){
    sa.getSheet("LIBRARIANS").then(response => {
        console.log(response);
        librarians = sa.parseSheetValues(response);
        console.log(librarians);
    });
}

function getVocab() {
    sa.getTableHeaders("HEADER_VOCAB_TYPE").then(response => {
        vocabHeaders = sa.parseTableHeaders(response);
        sa.getDataType().then(response => {
            vocabs = sa.parseVocab(response, vocabHeaders);
            for(let i = 0; i < vocabs.length; i++){
                vocabsArray[i] = vocabs[i];
            }
            console.log(vocabsArray);
        });
    });
}
function getTypes() {
    sa.getTableHeaders("HEADER_VOCAB_TYPE").then(response => {
        vocabHeaders = sa.parseTableHeaders(response);
        sa.getDataType().then(response => {
            types = sa.parseDataType(response, vocabHeaders);

            for(let i = 0; i < types.length; i++){
                typeArray[i] = types[i];
            }
            console.log(typeArray);
            getHeaders();
        });
    });
}


//GET LIST OF PROGRAMS
function getProgs() {
    sa.getSheet("PROGRAMS_AND_LIBRARIANS").then(response => {
        progInfo = sa.parseSheetValues(response);
        for(let i = 1; i < progInfo.length; i++){
            if(progInfo[i][1] === lib) {
                progArray[i] = progInfo[i][0];
            }
            if(sa.isAdmin()){
                progArray[i] = progInfo[i][0];
            }
        }
        console.log(progArray);
    });
}

function setLibrarian() {
  sa.getSheet("PROGRAMS_AND_LIBRARIANS").then(response => {
    lib = sa.selectFromTableWhereConditions(response, ["LIBRARIANS"], [{header:"PROGRAMS", value:document.getElementById("field6").value}], 1)[1][0];
    document.getElementById("field12").innerHTML = lib;
  });
}
