
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("btn1").addEventListener("click", () => {
        chrome.tabs.executeScript(null, {
            code: "console.log('hej')"
        });
        chrome.tabs.executeScript(null,{
            code:"document.body.style.backgroundColor='red'"
        })
    }) 
})



// var x = document.querySelectorAll("a.card-link.stretched-link");

//var myarray = []

//for (var i=0; i<x.length; i++){
//    var nametext = x[i].textContent;
 //   var cleantext = nametext.replace(/\s+/g, ' ').trim();
  //  var cleanlink = x[i].href;
   // myarray.push([cleantext,cleanlink]);
//};

/*
"background": {
    "service_worker": "background.js"
  }, 
  */