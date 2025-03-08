function mOve(uRl) {
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

    // URL에서 파일명 추출 (마지막 '/' 이후 문자열)
    const filename = url.split('/').pop().split('?')[0]; // 쿼리스트링 제거

    a.download = filename; // 파일명 지정
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const $body = document.querySelector('body');
function preventScroll(e) {
  e.preventDefault();
}
// 'wheel' 이벤트를 사용하여 스크롤 감지 후 방지
$body.addEventListener('wheel', preventScroll, { passive: false });
$body.addEventListener('click', function() { // body 를 다시 클릭하면 스크롤 재개
  $body.removeEventListener('wheel', preventScroll, { passive: false });
});

class linkClass extends HTMLElement {
  connectedCallback() {
    let name = this.getAttribute('name')
    let link = this.getAttribute('link')
    this.innerHTML = `<button class="btN" onclick="Goo('${link}')">${name}</button>`
  }
}
customElements.define('Golink', linkClass)