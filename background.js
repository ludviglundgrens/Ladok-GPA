async function get_gpa() { 
    console.log("calculating GPA")
    
    //inject waiting text 
    var par = document.createElement("p");
    var text = document.createTextNode("Calculating GPA...");
    par.appendChild(text);

    div = document.getElementsByClassName("row")[0]
    div.appendChild(par, div)

    function xmlToJson(xml) {
        // Create the return object
        var obj = {};
    
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
    
        // create children
        if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    };
    
    //get studentID
    res = await fetch("https://www.student.ladok.se/student/ladok/L3")
    text = await res.text()
    arr = await text.split("studentUID")
    uid = await arr[1]
    uid = await uid.split('\"')
    uid = await uid[1]

    // get schoolm
    school = await text.split("larosateSv =")
    school = await school[1]
    school = school.split(";")
    school = school[0]

    // get courseID
    url = "https://www.student.ladok.se/student/proxy/studiedeltagande/tillfallesdeltagande/kurstillfallesdeltagande/student/"
    url = url.concat(uid)
    res = await fetch(url)
    text = await res.text()
    parser = new DOMParser();
    dom = parser.parseFromString(text, "application/xml")
    obj = xmlToJson(dom)

    obj = obj["sd:TillfallesdeltagandeLista"]["sd:Tillfallesdeltaganden"]["sd:Tillfallesdeltagande"]

    
    pathlist = []
    obj.map((data)=>{
        pathlist.push((data["sd:Utbildningsinformation"]["sd:UtbildningUID"]["#text"]))
    })

    str1 = "https://www.student.ladok.se/student/proxy/resultat/studentenskurser/egenkursinformation/student/"
    str2 =  "/kursUID/"
    
    pathlist = await pathlist.map((path)=>{
        return str1.concat(uid, str2, path)  
    })
    
    df = []
    for (let index = 0; index < pathlist.length; index++) {
        try {
            res = await fetch(pathlist[index])
            text = await res.text()

            parser = new DOMParser();
            dom = parser.parseFromString(text, "application/xml")
            obj = xmlToJson(dom)

            grade = obj["rr:StudentensKurserKurs"]["rr:Kursversioner"]["rr:VersionensKurs"]["rr:ResultatPaUtbildning"]["rr:SenastAttesteradeResultat"]["rr:Betygsgradsobjekt"]["base:Kod"]["#text"]
            hp = obj["rr:StudentensKurserKurs"]["rr:Kursversioner"]["rr:VersionensKurs"]["rr:Omfattning"]["#text"]
            
            df.push([grade, hp])
        } catch (error) {
            console.log(error)
            console.log(pathlist[index])
        }
    }   

    sum_hp = 0
    sum_val = 0

    // Calculate GPA (ECTS)
    df.map(data =>{
        grade = data[0]
        hp = data[1]

        if(grade === "A"){
            grade = 5
        }
        if(grade === "B"){
            grade = 4
        }
        if(grade === "C"){
            grade = 3
        }
        if(grade === "D"){
            grade = 2
        }
        if(grade === "E"){
            grade = 1
        } 
        if(grade === "P") {
            grade = 1
        }
        if(grade === "F") {
            grade = 0
        }
        if(grade === "FX") {
            grade = 0
        }
        sum_hp = sum_hp + Number(hp)
        sum_val = sum_val + Number(grade)*Number(hp)
    })

    gpa = sum_val/sum_hp
    gpa = Number.parseFloat(gpa).toPrecision(4)

    //Inject GPA (ECTS) to element
    div = document.getElementsByClassName("row")[0]
    div.removeChild(div.lastChild);

    var par = document.createElement("p");
    var text = document.createTextNode("GPA (ECTS): "+gpa);
    par.appendChild(text);

    // KTH Exchange score
    if (school.includes("Kungliga Tekniska högskolan")){
        df.map(data =>{
            grade = data[0]
            hp = data[1]

            if(grade === "A"){
                grade = 5
            }
            if(grade === "B"){
                grade = 4.5
            }
            if(grade === "C"){
                grade = 4
            }
            if(grade === "D"){
                grade = 3.5
            }
            if(grade === "E"){
                grade = 3
            } 
            if(grade === "P") {
                grade = 0
                sum_hp = sum_hp - Number(hp)
                sum_val = sum_val - Number(grade)*Number(hp)
            }
            if(grade === "F") {
                grade = 0
            }
            if(grade === "FX") {
                grade = 0
            }
            sum_hp = sum_hp + Number(hp)
            sum_val = sum_val + Number(grade)*Number(hp)
        })
        kth = sum_val/sum_hp
        kth = Number.parseFloat(kth).toPrecision(4)
        
        //Inject KTH Exchange score to element
        par.appendChild(document.createElement('br'))
        var text = document.createTextNode("KTH Exchange: "+kth);
        par.appendChild(text);
    }
    // Append element to div
    div.appendChild(par, div)
} 

// setup for autoreload
gpa_render=false
setInterval(() => {

    if (gpa_render == false){
        setTimeout(get_gpa, 100)
        gpa_render = true
    }
},1000);

