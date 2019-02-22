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

  updateSceneMovie(sceneId, newurl) {
    return (
      axios({
        method: 'get',
        params: { new_url: newurl },
        url: `/flipbooks/ajax/scene/${sceneId}/update_movie/`,
      }).then(res => {
        return res;
      }).catch(err => {
        logr.error(err.data);
      })
    )

  }


  fetchScene(sceneId) {
    return (
      axios({
        method: 'get',
        url: `/api/scene/${sceneId}/`,
      })
        .then(response => {
          console.log("[Scene fetch successful]");
          //thisObj.setState({data: response.data});
          //this.firstLoad = false;
          return response;
        })
        .catch(error => {
          console.log(error);
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






  makeLambdaPie(stripId) {
    // TODO: this should take sceneId instead
    const param = 'stripid';
    const endpoint = `https://53e5kyqgq7.execute-api.us-east-2.amazonaws.com/production/framePie?${param}=${stripId}`;
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
        headers: { "X-CSRFToken": csrfToken }
      })
    )

  }

}


export default XhrHandler;