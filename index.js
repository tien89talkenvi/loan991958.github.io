var text='';
var chongiongenUS=0;
const voiceInEl = document.getElementById('voicegiong');//khai bao voiceInEl la bien toan cuc 
var lang_source_text;
var lang_dich_ra;
var rightside=true;
var giong;
const elm_player = document.getElementById("player");

function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  const voices = speechSynthesis.getVoices();

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    option.textContent = `${voices[i].name} (${voices[i].lang})`;
    document.getElementById("voicegiong").appendChild(option);
    if (option.textContent.includes("en-US") && option.textContent.includes("Zira")){
      document.getElementById("voicegiong").indexSelected = i;
    }
  }
}
//-------------------------------------
populateVoiceList();
if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}


//------------cac thong bao nho---------------------------
var messages = {
    "start": {
      msg: 'Click on the microphone icon and begin speaking.',
      class: 'alert-success'},
    "speak_now": {
      msg: 'Speak now.',
      class: 'alert-success'},
    "no_speech": {
      msg: 'No speech was detected. You may need to adjust your <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a>.',
      class: 'alert-danger'},
    "no_microphone": {
      msg: 'No microphone was found. Ensure that a microphone is installed and that <a href="//support.google.com/chrome/answer/2693767" target="_blank">microphone settings</a> are configured correctly.',
      class: 'alert-danger'},
    "allow": {
      msg: 'Click the "Allow" button above to enable your microphone.',
      class: 'alert-warning'},
    "denied": {
      msg: 'Permission to use microphone was denied.',
      class: 'alert-danger'},
    "blocked": {
      msg: 'Permission to use microphone is blocked. To change, go to chrome://settings/content/microphone',
      class: 'alert-danger'},
    "upgrade": {
      msg: 'Web Speech API is not supported by this browser. It is only supported by <a href="//www.google.com/chrome">Chrome</a> version 25 or later on desktop and Android mobile.',
      class: 'alert-danger'},
    "stop": {
        msg: 'Stop listening, click on the microphone icon to restart',
        class: 'alert-success'},
    "copy": {
      msg: 'Content copy to clipboard successfully.',
      class: 'alert-success'},
}
//cac bien global
var final_transcript = '';

var recognizing = false;
var ignore_onend;
var start_timestamp;
var recognition;
  
//cac ham ung voi cac su kien
$( document ).ready(function() {
    for (var i = 0; i < langs.length; i++) {
      select_source_language.options[i] = new Option(langs[i][0], i);
      select_target_language.options[i] = new Option(langs[i][0], i);
    }
    select_source_language.selectedIndex = 12; //viet
    select_target_language.selectedIndex = 1;  //english
    updateCountry();
    select_source_dialect.selectedIndex = 0;
    select_target_dialect.selectedIndex = 0;
    
    if (!('webkitSpeechRecognition' in window)) {
      upgrade();
    } else {
      showInfo('start'); 
      resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
      start_button.style.display = 'inline-block';
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
  
      recognition.onstart = function() {

        recognizing = true;
        showInfo('speak_now');
        resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
        start_img.src = 'icons/mic-animation.gif';
      };
  
      recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
          start_img.src = 'icons/mic.gif';
          showInfo('no_speech');
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          start_img.src = 'icons/mic.gif';
          showInfo('no_microphone');
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          if (event.timeStamp - start_timestamp < 100) {
            showInfo('blocked');
          } else {
            showInfo('denied');
          }
          ignore_onend = true;
        }
      };
  
      recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
          return;
        }
        start_img.src = 'icons/mic.gif';
        if (!final_transcript) {
          showInfo('start');
          return;
        }
        showInfo('stop');
        translate();
      };
  
      recognition.onresult = function(event) {
          var interim_transcript = '';
          resultsdich.innerHTML=''; //khi dang chuan bi thi cai nay phai empty
          //chu y rang van de kq trung gian va cuoi cung hien ra cho ta thay ct dang chay
          //nhung cuoi cung thi dich moi hien ra 
          for (var i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  final_transcript += event.results[i][0].transcript;
              } else {
                  interim_transcript += event.results[i][0].transcript; 
              }
          }
          final_transcript = capitalize(final_transcript);
          final_span.innerHTML = linebreak(final_transcript);
          interim_span.innerHTML = linebreak(interim_transcript);
      
        //final_transcript la global nen no van ton tai ca cac thay doi, den khi ta click nghe thi moi dich
        //resultsdich.innerHTML=translate(final_transcript);     
        //translate(final_transcript);     
      };

    }
});
  
  
function updateCountry() {
      for (var i = select_source_dialect.options.length - 1; i >= 0; i--) {
          select_source_dialect.remove(i);
      }
      var list = langs[select_source_language.selectedIndex];
      for (var i = 1; i < list.length; i++) {
          select_source_dialect.options.add(new Option(list[i][1], list[i][0]));
      }
      select_source_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
      //----
      for (var i = select_target_dialect.options.length - 1; i >= 0; i--) {
          select_target_dialect.remove(i);
      }
      var list = langs[select_target_language.selectedIndex];
      for (var i = 1; i < list.length; i++) {
          select_target_dialect.options.add(new Option(list[i][1], list[i][0]));
      }
      select_target_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
  
}
  
  
function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('upgrade');
}
  
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
  
var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
  
$("#start_button").click(function () {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    
    recognition.lang = select_source_dialect.value;
    //alert(recognition.lang); //thu cho nay thay dung roi khi nhap nut button start
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'icons/mic-slash.gif';
    showInfo('allow');
    start_timestamp = event.timeStamp;
});
  
$("#select_source_language").change(function () {
    updateCountry();
});
  
function showInfo(s) {
    if (s) {
      var message = messages[s];
      $("#info").html(message.msg);
      $("#info").removeClass();
      $("#info").addClass('alert');
      $("#info").addClass(message.class);
    } else {
      $("#info").removeClass();
      $("#info").addClass('d-none');
    }
}
//----------------------------------------------
$("#hoanviLangs").click(function () {
    //1.lay chi so lang ben phai dat no la jp
    let jp = select_target_language.selectedIndex;
    //2. lay chi so lang ben trai dat no la jt
    let jt = select_source_language.selectedIndex;
    //3. di tim ben trai cai phan tu co chi so index la jp va default tai do (tuc la chon phan tu do)
    select_source_language.selectedIndex = jp;
    select_target_language.selectedIndex = jt;
    //4. hvi 2 lang bc rut ra 2 lang tuong ung 2 jp jt
    const sourceLanguaget =langs[jp][1][0];
    const targetLanguaget =langs[jt][1][0];
    //5. hvi 2 text. vi final_transcript do noi tao ra nen type khac voi van dich nen ko hoan vi
    //ma phai xoa trong de noi lai
    final_transcript = '';
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    document.getElementById("resultsdich").textContent ='';
    text = '';

    updateCountry();
}); 
//xu li pit/rate/vol ----------------------------------------------------------------------------------
//khai bao cac bien toan cuc va gan gitri dau
const pitchInEl = document.getElementById('pitch');
const rateInEl = document.getElementById('rate');
const volumeInEl = document.getElementById('volume');

const pitchOutEl = document.querySelector('output[for="pitch"]');
const rateOutEl = document.querySelector('output[for="rate"]');
const volumeOutEl = document.querySelector('output[for="volume"]');

function updateOutputs() {//---------
    // display current values of all range inputs, phoi bay gtri hien huu
    pitchOutEl.textContent = pitchInEl.value;
    rateOutEl.textContent = rateInEl.value;
    volumeOutEl.textContent = volumeInEl.value;
}

// add UI event handlers, khi pit/rate/vol thay doi thi chay ham updateOutputs() o tren de lay gt moi
pitchInEl.addEventListener('change', updateOutputs);
rateInEl.addEventListener('change', updateOutputs);
volumeInEl.addEventListener('change', updateOutputs);

//----------------------------------------
//Xu li 3 nut play/pause/stop2 phia duoi 

// grab the UI elements to work with
const textEl = document.getElementById('resultsdich');

const playEl = document.getElementById('play');
const pauseEl = document.getElementById('pause');
const stopEl = document.getElementById('stop');

// add UI event handlers
playEl.addEventListener('click', play);
pauseEl.addEventListener('click', pause);
stopEl.addEventListener('click', stop);

// set text
textEl.innerHTML = text;
//-----------------------
function play() {
  if (window.speechSynthesis.speaking) {
    // there's an unfinished utterance
    window.speechSynthesis.resume();
  } else {
    // start new utterance
    if (text==''){return;}  // de tranh giat giat khi text trong
    
    //text nay la text dich o phan translate qua
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.addEventListener('start', handleStart);
    utterance.addEventListener('pause', handlePause);
    utterance.addEventListener('resume', handleResume);
    utterance.addEventListener('end', handleEnd);
    utterance.addEventListener('boundary', handleBoundary);
    
    //utterance.voice = window.speechSynthesis.getVoices().find(voice => voiceInEl.value.includes(voice.voiceURI));
    utterance.voice = window.speechSynthesis.getVoices().find(voice => voiceInEl.value.includes(voice.name));
  
    utterance.pitch = pitchInEl.value;
    utterance.rate = rateInEl.value;
    utterance.volume = volumeInEl.value;
    //utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);

  }
}

function pause() {
  window.speechSynthesis.pause();
}

function stop() {
  window.speechSynthesis.cancel();
  // Safari doesn't fire the 'end' event when cancelling, so call handler manually
  handleEnd();
}

function handleStart() {
  playEl.disabled = true;
  pauseEl.disabled = false;
  stopEl.disabled = false;
}

function handlePause() {
  playEl.disabled = false;
  pauseEl.disabled = true;
  stopEl.disabled = false;
}

function handleResume() {
  playEl.disabled = true;
  pauseEl.disabled = false;
  stopEl.disabled = false;
}

function handleEnd() {
  playEl.disabled = false;
  pauseEl.disabled = true;
  stopEl.disabled = true;
  
  // reset text to remove mark
  textEl.innerHTML = text;
}

function handleBoundary(event) {
  if (event.name === 'sentence') {
    // we only care about word boundaries
    return;
  }

  const wordStart = event.charIndex;
  let wordLength = event.charLength;
  if (wordLength === undefined) {
    // Safari doesn't provide charLength, so fall back to a regex to find the current word and its length (probably misses some edge cases, but good enough for this demo)
    const match = text.substring(wordStart).match(/^[a-z\d']*/i);
    wordLength = match[0].length;
  }
  // wrap word in <mark> tag
  const wordEnd = wordStart + wordLength;
  const word = text.substring(wordStart, wordEnd);
  const markedText = text.substring(0, wordStart) + '<mark>' + word + '</mark>' + text.substring(wordEnd);
  textEl.innerHTML = markedText;

}

//--end cac bien va ham lquan recognition speech --------------------------------------------
function translate() { //(5)
  const inputText = final_transcript;
  const outputTextEle = document.getElementById("resultsdich");

  const sourceLanguaget =langs[document.querySelector("#select_source_language").value][1][0];
  const targetLanguaget =langs[document.querySelector("#select_target_language").value][1][0];
  //document.querySelector("#select_source_language").value la chi so
  //langs[document.querySelector("#select_target_language").value][1] la phan tu 1 cua list, co dang ['vi-VN']
  //langs[document.querySelector("#select_target_language").value][1][0] la chuoi 'vi-VN'
  
  let sourceLanguage = sourceLanguaget.substring(0,2);
  let targetLanguage = targetLanguaget.substring(0,2);
  //alert(sourceLanguage);
  //alert(targetLanguage);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputText)}`;

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200)
    {
        const responseReturned = JSON.parse(this.responseText);
        const translations = responseReturned[0].map((text) => text[0]);
        const outputText = translations.join(" ");
        outputTextEle.textContent = outputText;
        //text cua kq dich chua fdung trong outputTextEle
        text = outputTextEle.textContent;
        listen_button.click(); //thuc thi ham readTextQuick()
    }
  };
  //---------------------
  xhttp.open("GET", url);
  xhttp.send();
}

//-------------------------------xoa text phan duoi------------------------

//khi nhap nut loa listen_button.click() thi thi thanh ham nay
//bay gio la play()
function readTextQuick(rightside){
  if (rightside===true){
    //select_target_language.value la 1 list dang ['English',['en-US']]
    giong = langs[select_target_language.value][1][0];
  }else{
    //select_source_language.value la 1 list dang ['English',['en-US']]
    giong = langs[select_source_language.value][1][0];
  }  
  //alert(giong);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = window.speechSynthesis.getVoices().find(voice => voice.lang.includes(giong));
  //voice_speak_dich = utterance.voice; 
  utterance.lang = utterance.voice;
  //alert(utterance.lang); la 1 object, khong la chuoi 
  utterance.pitch = pitchInEl.value;
  utterance.rate = rateInEl.value;
  //utterance.volume = volumeInEl.value;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);

}          
//----------------------
function act_source_lang(){
  //lang vd vi-VN
  //alert(langs[select_source_language.selectedIndex][1][0]);
  final_transcript = '';
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  document.getElementById("resultsdich").textContent ='';
  text = '';
  //lang vd vi-VN
  //alert(langs[select_source_language.selectedIndex][1][0]);

}
//-------------------------
function act_target_lang(){

  //da thay doi gia tri ngam hieu cho nen chay translate()
  translate();
  //trong translate() co phan readQuick luon
  var els = document.getElementsByClassName("youtube-marker-l"); 
  if (els.length>0){
    lang_source_text =langs[document.querySelector("#select_source_language").value][1][0].substring(0,2);
    lang_dich_ra =langs[document.querySelector("#select_target_language").value][1][0].substring(0,2);
    t_translate(lang_source=lang_source_text, lang_dich_ra=lang_dich_ra);
  }
}
//-------------------
function xoaduoi(){
  act_source_lang();

}
//-------------------------------
function get_Text_From() {
  var x = document.getElementById("getTextFrom").selectedIndex;
  var y = document.getElementById("getTextFrom").options;

  if (y[x].text=="HOME") {
    document.getElementById("datUrlYt").innerHTML="";
    document.getElementById("player").src = "icons/freevoicetext.webp";
  }  
  if (y[x].text.includes("1.")) {
    document.getElementById("getTextFrom1").click();
  }
  if (y[x].text.includes("2.")) {
    document.getElementById("getTextFrom2").click();
  }  
  if (y[x].text.includes("3.")) {
    document.getElementById("getTextFrom3").click();
  }  
  if (y[x].text.includes("4.")) {
    document.getElementById("getTextFrom4").click();
  }  
  if (y[x].text.includes("5.")) {
    document.getElementById("getTextFrom5").click();
  }  

  
}
//---------
function gettf6_urlytvideo(){
  var html6 = '<br><label for="uname">&nbspEnter url&nbsp</label><input type="text" id="nhapurl" name="name" /></div><button onclick="xuliUrlNhap()">&nbspSubmit</button>';
  let elm_DatUrlYt = document.getElementById("datUrlYt");
  elm_DatUrlYt.innerHTML=html6;
}
//-----
function xuliUrlNhap(){
  let urlnhap = document.getElementById("nhapurl").value;
  if (urlnhap===""){
    document.getElementById("getTextFrom").selectedIndex=0;
    document.getElementById("player").src = "icons/freevoicetext.webp";
    let elm_DatUrlYt = document.getElementById("datUrlYt");
    elm_DatUrlYt.innerHTML="";
    return;
  }
  elm_player.src = urlnhap; 
  setTimeout(() => {
    let elm_DatUrlYt = document.getElementById("datUrlYt");
    elm_DatUrlYt.innerHTML="";
  }, "500");

}
//-------
function gettf1(){
  document.getElementById("player").src="icons/Rajio_taiso_1.mp4";
}
//------------------------------
function gettf2(){
  document.getElementById("player").src="icons/TD10P.mp4";
}
function gettf3(){
  document.getElementById("player").src="icons/td_toi_nam_chau.mp4";
}
function gettf4(){
  document.getElementById("player").src="icons/Td_ta_tay_all.mp4";
}
function gettf5(){
  document.getElementById("player").src="icons/Td_ta_tay_leg.mp4";
}

//--------------
function gettf1_copypaste(){
  //alert('1');
  //const element = document.getElementById("player");
  //element.remove();
  
  //tao TEXTAREA
	var tarea = document.createElement("TEXTAREA");
  tarea.setAttribute("id", "tarea");
  tarea.maxLength = "5000";
  tarea.cols = "40";
  tarea.rows = "4";
  //cha datUrlYt hay nhan thang con tarea vao
  document.getElementById("datUrlYt").appendChild(tarea);
  //tao noi br
  const brtag = document.createElement('br');
  brtag.setAttribute("id", "brtag");
  document.getElementById("datUrlYt").appendChild(brtag);
  //tao button
  const newButton = document.createElement('button');
  newButton.textContent = 'Enter text then click OK';
  newButton.setAttribute("id", "newButton");
  newButton.setAttribute("onclick", "xuli_textnhap()");
  document.getElementById("datUrlYt").appendChild(newButton);

}
//--------------
function xuli_textnhap(){
  let textAll = tarea.value;
  if (textAll.length > 0){
    let lText = textAll.split(".");
    let chp = '';
    for (let i = 0; i < lText.length; i++) {
      if (lText[i] !== ""){
        //text = only_translate(lText[i]);
        let chp1 = '<div class="f-gridn">\n'
        let chp2 = '<div onclick="read_left()" class="youtube-marker-l"'+'>'+lText[i]+'. '+'</div>\n';
        let chp3 = '<div onclick="read_right()" class="youtube-marker-r"'+'>'+''+'. '+'</div>\n';
        let chp4 = '</div>\n'; 
        chp = chp + chp1 + chp2 + chp3 + chp4;
      }  
    }  
    document.getElementById("chuadivyt").innerHTML=chp;
  }else{
    console.log('no text');
  }
  document.getElementById("tarea").value = "";
  //tarea.remove();
  //brtag.remove();
  //newButton.innerHTML="";
  //newButton.remove();
  //document.getElementById("getTextFrom").selectedIndex = 0;
  //sau khi co cac div l va r, bay gio dich
  lang_source_text =langs[document.querySelector("#select_source_language").value][1][0].substring(0,2);
  lang_dich_ra =langs[document.querySelector("#select_target_language").value][1][0].substring(0,2);
  t_translate(lang_source=lang_source_text, lang_dich_ra=lang_dich_ra);
}
//--------------
//-------------
function t_translate(lang_source, lang_dich_ra) { 
  const sourceLanguage = lang_source;
  const targetLanguage = lang_dich_ra;
  var els = document.getElementsByClassName("youtube-marker-l"); // Creates an HTMLObjectList not an array.
  var elsd = document.getElementsByClassName("youtube-marker-r")

  Array.prototype.forEach.call(els, function(el,i) {
      let inputText = el.innerText;
      let outputTextEle = elsd[i];

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(inputText)}`;

      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200){
              const responseReturned = JSON.parse(this.responseText);
              const translations = responseReturned[0].map((text) => text[0]);
              const outputText = translations.join(" ");
              outputTextEle.textContent = outputText;
          }
      };
      //---------------------
      xhttp.open("GET", url);
      xhttp.send();
  });
  
}
//-----------------
function read_left(){
  //lang_source_text da khai bao global va co gt moi khi lap youtube-marker-l
  var els = document.getElementsByClassName("youtube-marker-l"); 
  text="";
  Array.prototype.forEach.call(els, function(el,i) {
      text = text + el.innerText + " ";
      //console.log(i,text);
  });
  rightside = false;
  readTextQuick(rightside);
}
//----------------------
function read_right(){
  //lang_dich_ra da khai bao global va co gt moi khi lap youtube-marker-r;
  var elsd = document.getElementsByClassName("youtube-marker-r")
  text = "";
  Array.prototype.forEach.call(elsd, function(el,i) {
    text = text + el.innerText + " ";
  });
  rightside = true;
  readTextQuick(rightside);

}

//--------------------
function hdansd(){
  let texhd ='';
  texhd = texhd + 'App này dùng để dịch tiếng nói và văn bản giữa hai ngôn ngữ trong 14 ngôn ngữ được chọn. ';
  texhd = texhd + 'Nó phục vụ cho việc đàm thoại có thông dịch và việc học tiếng Anh, tiếng Việt là chính. \n';
  texhd = texhd + '\n';
  texhd = texhd + 'Việc dịch qua lại giữa các thứ tiếng được lấy từ các dịch vụ miễn phí của Google Translation. Nó chạy rất ổn định trên trình duyệt Chrome Laptop và Safari Iphone.\n';
  texhd = texhd + 'Cái hay nhất là tiếng nói phát ra ngay khi văn bản được dịch mà không cần tương tác của người dùng, ngoại trừ lần đầu tiên. \n';
  texhd = texhd + '\n';
  texhd = texhd + 'Vắn tắt cách sử dụng như sau: \n';
  texhd = texhd + '\n';
  
  texhd = texhd + '1. Chọn ngôn ngữ nói và ngôn ngữ nghe (mặc định là Việt-Anh).\n';
  texhd = texhd + '2. Nhấp vào biểu tương micro rồi nói. Micro sẽ nhấp nháy. Văn bản nói sẽ hiện ra. Nhấp vào nữa thì nó ngưng và bắt đầu dịch. Văn bàn dịch sẽ hiện ra và tự động phát âm (trừ lân đầu phải nhấp vào micro).\n';
  texhd = texhd + 'Phía dải trên cúng sẽ hiện ra giọng phát âm và thông tin các giọng có trong máy.\n';
  texhd = texhd + 'Muốn nghe lại thì nhấp vào biểu tượng loa.\n';
  texhd = texhd + 'Nếu muốn đổi vai ngôn ngữ nói và nghe thì nhấp mũi tên ở giữa. Để tiếp tục nói lại nhấp micro...\n';
  texhd = texhd + '3. Phần bên dưới là để "Chơi thêm" giọng phát ra loa nhanh/chậm/cao/trầm... \n';
  texhd = texhd + 'Chọn giọng nào trên dải phía trên cùng thì văn bản dịch ra sẽ phát giọng đó cho đến khi dùng lại phần giữa. \n';
  
  
  alert(texhd);
}
