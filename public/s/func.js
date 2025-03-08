document.addEventListener("DOMContentLoaded", function () {
    // CSS 캐시 방지
    let cssLink = document.querySelector('link[href^="s/main.css"]');
    if (cssLink) {
        cssLink.href = "s/main.css?v=" + new Date().getTime();
    }

    // JS 캐시 방지
    let jsScript = document.querySelector('script[src^="s/func.js"]');
    if (jsScript) {
        let newScript = document.createElement("script");
        newScript.src = "s/func.js?v=" + new Date().getTime();
        newScript.defer = true; // 기존 스크립트처럼 비동기 로드
        document.body.appendChild(newScript);

        // 기존 스크립트 삭제 (중복 실행 방지)
        jsScript.remove();
    }
});

function mOve(uRl) {        //모달창에서 쓰니까 지우면 안됨
    function isMobile() {
      var userAgent = navigator.userAgent;
      var mobile = /(iPhone|iPad|Android|BlackBerry|Windows Phone)/i.test(userAgent);
      return mobile;
    }

    if (isMobile()) {
        window.location.href=`https://docs.google.com/viewerng/viewer?url=${uRl}`;
    } else {
       	window.location.href=`${uRl}`;
    }
}


function Goo(URl) {
    window.location.href=`${URl}`;
}

function dowN(url) {
    const a = document.createElement('a');
    a.href = url;
    const filename = url.split('/').pop().split('?')[0];
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


class linkClass extends HTMLElement {
  connectedCallback() {
    let name = this.getAttribute('name')
    let link = this.getAttribute('link')
    this.innerHTML = `<button class="btN" onclick="Goo('${link}')">${name}</button>`
  }
}
customElements.define('go-link', linkClass)