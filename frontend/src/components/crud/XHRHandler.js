import axios from 'axios';
import Helper from '../Helper';
import Logr from '../tools/Logr';

const logr = new Logr('XHR');
const h = new Helper();

class XhrHandler {
  getCSRFToken(formId) {
    // This function require django rendered form in the template
    const possibleForms = ["#scene_create_form", "#strip_create_form", "#frame_create_form"];

    let $form = null;
    if (formId === undefined) {

      let grabbed;
      for (let i = 0; i < possibleForms.length; i++) {
        grabbed = document.querySelector(possibleForms[i]);
        if (grabbed != null) {
          $form = grabbed;
          break;
        }

      }

      if ($form == null) {
        console.error("Cannot find any form to grab CSRFToken!");
        return false;
      }

    } else {
      $form = document.querySelector(formId);
    }

    const formData = h.serializeForm($form);
    const csrfToken = formData ? (formData.hasOwnProperty("csrfmiddlewaretoken") ? formData.csrfmiddlewaretoken : null) : null;

    return csrfToken;
  }






  fetchChapter(chapterId) {
    return (
      axios({
        method: 'get',
        url: `/api/chapter/${chapterId}/`,
      }).then(response => {
        return response;
      }).catch(error => {
        logr.error(error);
      })
    );
  }








  createScene(chapterId, formData, csrfToken) {
    return this.makeXHR('post', formData, `/api/chapter/${chapterId}/scene/create/`, csrfToken);
  }

  updateScene(sceneId, formData, csrfToken) {

    // TODO: patch update for Scene does not exist yet. This is template
    //       copied from updateStrip

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: formData,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          logr.error(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  updateSceneMovieURL(sceneId, newUrl, csrfToken) {
    const fd = new FormData();
    fd.append('movie_url', newUrl);

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: fd,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          logr.error(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  addToScenePlayback(sceneId, newPlayback, csrfToken) {
    // Scene stores up to 3 playback information in case something goes wrong
    // with the newest playback data.

    const fd = new FormData();
    fd.append('playback', newPlayback); 
    // TODO: validate playback

    // TODO: this appears to be near identical to updateSceneMovieURL.
    //       It's because both are PATCH request. Find a way to merge them.

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: fd,
        headers: { 'X-CSRFToken': csrfToken },
      }).then(response => {
        return response;
      }).catch(error => {
        logr.error(error);
        // TODO: add better error message that is visible on frontend
      })
    )

  }

  convertToStoreURLs(urls, extArr) {
    // Takes in relative url, and finds storage link for it
    // Currently used in VideoFeeder in order to retrieve video information from a field
    // that is not actually a FileField!

    if (!urls || urls.length === 0) {
      logr.warn('Url not provided retrieve from storage.');
      return false;
    }
    if (!extArr || extArr.length === 0) {
      logr.warn('Extension to check for storage url is not provided');
      return false;
    }

    // chain request to get url
    const urlReqProms = [];
    urls.forEach(url => {
      const urlParts = url.split('.');
      logr.info(encodeURIComponent(url) );
      if (extArr.includes(urlParts[urlParts.length - 1])) { // make sure extension matches
        urlReqProms.push(
          axios({
            method: 'get',
            params: { rel_url: encodeURI(url) },
            url: '/flipbooks/s3/getURL/',
          }).then(response => {
            return response;
          })
        );
      }
    });

    // resolve all
    // DO I NEED SEMI COLON OR WILL IT BREAK IT AGAIN
    return Promise.all(urlReqProms)

  }

  fetchScene(sceneId) {
    return (
      axios({
        method: 'get',
        url: `/api/scene/${sceneId}/`,
      })
        .then(response => {
          logr.info('[Scene fetch successful]');
          // thisObj.setState({data: response.data});
          // this.firstLoad = false;
          return response;
        })
        .catch(error => {
          console.log(error);
        })
    )
  }

  fetchSceneList(chapterId) {
    return (
      axios({
        method: 'get',
        url: `/api/chapter/${chapterId}/scene/all/`,
      }).then(res => {
        logr.info('Scene list fetch successful');
        return res;
      }).catch(error => {
        logr.error(error);
      })
    )
  }





  createStrip(sceneId, formData, csrfToken) {

    if (csrfToken === undefined) {
      csrfToken = this.getCSRFToken();
    }

    return (
      axios({
        method: 'post',
        url: `/api/scene/${sceneId}/strip/create/`,
        data: formData,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          console.log("[New Strip created]");
          //thisObj.setState({data: response.data});
          //this.firstLoad = false;
          return response;
        })
        .catch(error => {
          console.log(error);
        })
    )
  }

  updateStrip(stripId, formData, csrfToken) {
    return (
      axios({
        method: 'patch',
        url: `/api/strip/${stripId}/update/`,
        data: formData,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }





  createFrame(stripId, formData, csrfToken) {
    return this.makeXHR('post', formData, `/api/strip/${stripId}/frame/create/`, csrfToken)
  }

  editFrame(frameId, formData, csrfToken) {
    return (
      axios({
        method: 'patch',
        url: `/api/frame/${frameId}/update/`,
        data: formData,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  destoryFrame(frameId, csrfToken) {
    console.log("[Internal] CSRF token grabbed for FrameDelete: " + this.getCSRFToken());

    return (
      axios({
        method: 'delete',
        url: `/api/frame/${frameId}/`,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  destroyStrip(stripId, csrfToken) {
    return this.makeXHR('delete', null, `/api/strip/${stripId}/`, csrfToken);
  }






  makeLambdaPie(sceneId) {
    // TODO: this should take sceneId instead
    const param = 'sceneid';
    const endpoint = `https://53e5kyqgq7.execute-api.us-east-2.amazonaws.com/production/framePie?${param}=${sceneId}`;
    return this.makeXHR('get', null, endpoint, null, 1);
  }


  // Trying this out
  django_getSceneUrl(name, data) {
    // django seem to really hate it when there is ":" in the url...

    let parsedName = name.split(":");
    parsedName = parsedName.join("--colon--");
    return this.makeXHR('get', null, `/flipbooks/rh/get_url_by_name/${parsedName}/${data.pk}/`, null);
  }




  // Attempt at generic
  makeXHR(method, data, endpoint, csrfToken, hder) {

    // TODO: investigate why using this.getCSRFToken gets 403 error
    // if (csrfToken === undefined) {const csrfToken = this.getCSRFToken();}

    hder = hder ? {} : { 'X-CSRFToken': csrfToken };

    return (
      axios({
        method: method,
        url: endpoint,
        data: data,
        headers: hder
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend

        })
    )
  }

  // For recursion!
  getPromise(method, data, endpoint, csrfToken) {

    // TODO: investigate why using this.getCSRFToken gets 403 error
    // if (csrfToken === undefined) {const csrfToken = this.getCSRFToken();}

    return (
      axios({
        method: method,
        url: endpoint,
        data: data,
        headers: { 'X-CSRFToken': csrfToken }
      })
    )

  }

}


export default XhrHandler;