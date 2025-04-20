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
        newScript.defer = true;
        document.body.appendChild(newScript);
        jsScript.remove();
    }

    // 커스텀 태그 등록
    if (!customElements.get('go-link')) {
        class linkClass extends HTMLElement {
            connectedCallback() {
                let name = this.getAttribute('name')
                let link = this.getAttribute('link')
                this.innerHTML = `<button class="btN" onclick="Goo('${link}')">${name}</button>`
            }
        }
        customElements.define('go-link', linkClass)
    }

    if (!customElements.get('modal-pre')) {
        class modalClass extends HTMLElement {
            connectedCallback() {
                let modalId = this.getAttribute('mid')
                let titleText = this.getAttribute('tt')
                let urlLink1 = this.getAttribute('scrt1')
                let urlLink2 = this.getAttribute('scrt2')
                this.innerHTML = `<div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5" id="exampleModalLabel" style="font-family: 'CustomFont1', Arial, sans-serif;">${titleText}</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>두 방법 중 하나를 선택하세요.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink1}" data-bs-dismiss="modal">다운로드</button><button type="button" class="btn btn-primary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink2}" data-bs-dismiss="modal">열기</button></div></div></div></div>`
            }
        }
        customElements.define('modal-pre', modalClass)
    }
});

function mOve(uRl) {        //모달창에서 쓰니까 지우면 안됨
    function isMobile() {
      var userAgent = navigator.userAgent;
      var mobile = /(iPhone|iPad|Android|BlackBerry|Windows Phone)/i.test(userAgent);
      return mobile;
    }

    if (isMobile()) {
        //window.location.href=`https://docs.google.com/viewerng/viewer?url=${uRl}`;
        window.location.href=`http://mj-m.kro.kr/pdfviewer/?url=${uRl}`;
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

/*
class linkClass extends HTMLElement {
  connectedCallback() {
    let name = this.getAttribute('name')
    let link = this.getAttribute('link')
    this.innerHTML = `<button class="btN" onclick="Goo('${link}')">${name}</button>`
  }
}
customElements.define('go-link', linkClass)

class modalClass extends HTMLElement {
  connectedCallback() {
    let modalId = this.getAttribute('mId')
    let titleText = this.getAttribute('tT')
    let urlLink1 = this.getAttribute('scrt1')
    let urlLink2 = this.getAttribute('scrt2')
    this.innerHTML = `<div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5" id="exampleModalLabel" style="font-family: 'CustomFont1', Arial, sans-serif;">${titleText}</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>두 방법 중 하나를 선택하세요.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink1}" data-bs-dismiss="modal">다운로드</button><button type="button" class="btn btn-primary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink2}" data-bs-dismiss="modal">열기</button></div></div></div></div>`
  }
}
customElements.define('modal-pre', modalClass)

if (!customElements.get('go-link')) {
  class linkClass extends HTMLElement {
    connectedCallback() {
      let name = this.getAttribute('name')
      let link = this.getAttribute('link')
      this.innerHTML = `<button class="btN" onclick="Goo('${link}')">${name}</button>`
    }
  }
  customElements.define('go-link', linkClass)
}

if (!customElements.get('modal-pre')) {
  class modalClass extends HTMLElement {
    connectedCallback() {
      let modalId = this.getAttribute('mId')
      let titleText = this.getAttribute('tT')
      let urlLink1 = this.getAttribute('scrt1')
      let urlLink2 = this.getAttribute('scrt2')
      this.innerHTML = `<div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 class="modal-title fs-5" id="exampleModalLabel" style="font-family: 'CustomFont1', Arial, sans-serif;">${titleText}</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>두 방법 중 하나를 선택하세요.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink1}" data-bs-dismiss="modal">다운로드</button><button type="button" class="btn btn-primary" style="font-family: 'CustomFont1', Arial, sans-serif;" onclick="${urlLink2}" data-bs-dismiss="modal">열기</button></div></div></div></div>`
    }
  }
  customElements.define('modal-pre', modalClass)
}
*/
