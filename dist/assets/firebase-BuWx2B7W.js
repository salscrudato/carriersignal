var t={};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=63&s|128):55296==(64512&s)&&r+1<t.length&&56320==(64512&t.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&t.charCodeAt(++r)),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=63&s|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=63&s|128)}return e},n={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const e=t[s],i=s+1<t.length,o=i?t[s+1]:0,a=s+2<t.length,c=a?t[s+2]:0,u=e>>2,h=(3&e)<<4|o>>4;let l=(15&o)<<2|c>>6,d=63&c;a||(d=64,i||(l=64)),r.push(n[u],n[h],n[l],n[d])}return r.join("")},encodeString(t,n){return this.HAS_NATIVE_SUPPORT&&!n?btoa(t):this.encodeByteArray(e(t),n)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&t[n++])<<12|(63&t[n++])<<6|63&t[n++])-65536;e[r++]=String.fromCharCode(55296+(i>>10)),e[r++]=String.fromCharCode(56320+(1023&i))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&o)}}return e.join("")}(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<t.length;){const e=n[t.charAt(i++)],o=i<t.length?n[t.charAt(i)]:0;++i;const a=i<t.length?n[t.charAt(i)]:64;++i;const c=i<t.length?n[t.charAt(i)]:64;if(++i,null==e||null==o||null==a||null==c)throw new r;const u=e<<2|o>>4;if(s.push(u),64!==a){const t=o<<4&240|a>>2;if(s.push(t),64!==c){const t=a<<6&192|c;s.push(t)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class r extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const s=function(t){return function(t){const r=e(t);return n.encodeByteArray(r,!0)}(t).replace(/\./g,"")};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const i=()=>
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,o=()=>{if("undefined"==typeof document)return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(r){return}const e=t&&function(t){try{return n.decodeString(t,!0)}catch(r){console.error("base64Decode failed: ",r)}return null}(t[1]);return e&&JSON.parse(e)},a=()=>{try{return i()||(()=>{if("undefined"==typeof process)return;const e=t.__FIREBASE_DEFAULTS__;return e?JSON.parse(e):void 0})()||o()}catch(e){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`)}},c=t=>{const e=(t=>a()?.emulatorHosts?.[t])(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return"["===e[0]?[e.substring(1,n-1),r]:[e.substring(0,n),r]},u=()=>a()?.config;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class h{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),"function"==typeof t&&(this.promise.catch(()=>{}),1===t.length?t(e):t(e,n))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function d(t){return(await fetch(t,{credentials:"include"})).ok}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f={};let p=!1;function g(t,e){if("undefined"==typeof window||"undefined"==typeof document||!l(window.location.host)||f[t]===e||f[t]||p)return;function n(t){return`__firebase__banner__${t}`}f[t]=e;const r="__firebase__banner",s=function(){const t={prod:[],emulator:[]};for(const e of Object.keys(f))f[e]?t.emulator.push(e):t.prod.push(e);return t}().prod.length>0;function i(){const t=document.createElement("span");return t.style.cursor="pointer",t.style.marginLeft="16px",t.style.fontSize="24px",t.innerHTML=" &times;",t.onclick=()=>{p=!0,function(){const t=document.getElementById(r);t&&t.remove()}()},t}function o(){const t=function(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}(r),e=n("text"),o=document.getElementById(e)||document.createElement("span"),a=n("learnmore"),c=document.getElementById(a)||document.createElement("a"),u=n("preprendIcon"),h=document.getElementById(u)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(t.created){const e=t.element;!function(t){t.style.display="flex",t.style.background="#7faaf0",t.style.position="fixed",t.style.bottom="5px",t.style.left="5px",t.style.padding=".5em",t.style.borderRadius="5px",t.style.alignItems="center"}(e),function(t,e){t.setAttribute("id",e),t.innerText="Learn more",t.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",t.setAttribute("target","__blank"),t.style.paddingLeft="5px",t.style.textDecoration="underline"}(c,a);const n=i();!function(t,e){t.setAttribute("width","24"),t.setAttribute("id",e),t.setAttribute("height","24"),t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","none"),t.style.marginLeft="-6px"}(h,u),e.append(h,o,c,n),document.body.appendChild(e)}s?(o.innerText="Preview backend disconnected.",h.innerHTML='<g clip-path="url(#clip0_6013_33858)">\n<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6013_33858">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>'):(h.innerHTML='<g clip-path="url(#clip0_6083_34804)">\n<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6083_34804">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>',o.innerText="Preview backend running in this workspace."),o.setAttribute("id",e)}"loading"===document.readyState?window.addEventListener("DOMContentLoaded",o):o()}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m(){return!function(){const t=a()?.forceEnvironment;if("node"===t)return!0;if("browser"===t)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(e){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class y extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,y.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,v.prototype.create)}}class v{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},r=`${this.service}/${t}`,s=this.errors[t],i=s?function(t,e){return t.replace(w,(t,n)=>{const r=e[n];return null!=r?String(r):`<${n}?>`})}(s,n):"Error",o=`${this.serviceName}: ${i} (${r}).`;return new y(r,o,n)}}const w=/\{\$([^}]+)}/g;function _(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const n=t[s],i=e[s];if(E(n)&&E(i)){if(!_(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function E(t){return null!==t&&"object"==typeof t}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b(t){return t&&t._delegate?t._delegate:t}class T{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I="[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const t=new h;if(this.instancesDeferred.set(e,t),this.isInitialized(e)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:e});n&&t.resolve(n)}catch(n){}}return this.instancesDeferred.get(e).promise}getImmediate(t){const e=this.normalizeInstanceIdentifier(t?.identifier),n=t?.optional??!1;if(!this.isInitialized(e)&&!this.shouldAutoInitialize()){if(n)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:e})}catch(r){if(n)return null;throw r}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,this.shouldAutoInitialize()){if(function(t){return"EAGER"===t.instantiationMode}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t))try{this.getOrInitializeService({instanceIdentifier:I})}catch(e){}for(const[t,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const t=this.getOrInitializeService({instanceIdentifier:r});n.resolve(t)}catch(e){}}}}clearInstance(t=I){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...t.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return null!=this.component}isInitialized(t=I){return this.instances.has(t)}getOptions(t=I){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[s,i]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&i.resolve(r)}return r}onInit(t,e){const n=this.normalizeInstanceIdentifier(e),r=this.onInitCallbacks.get(n)??new Set;r.add(t),this.onInitCallbacks.set(n,r);const s=this.instances.get(n);return s&&t(s,n),()=>{r.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const r of n)try{r(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=t,r===I?void 0:r),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch{}var r;return n||null}normalizeInstanceIdentifier(t=I){return this.component?this.component.multipleInstances?t:I:t}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class C{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new S(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var A,D;(D=A||(A={}))[D.DEBUG=0]="DEBUG",D[D.VERBOSE=1]="VERBOSE",D[D.INFO=2]="INFO",D[D.WARN=3]="WARN",D[D.ERROR=4]="ERROR",D[D.SILENT=5]="SILENT";const N={debug:A.DEBUG,verbose:A.VERBOSE,info:A.INFO,warn:A.WARN,error:A.ERROR,silent:A.SILENT},k=A.INFO,R={[A.DEBUG]:"log",[A.VERBOSE]:"log",[A.INFO]:"info",[A.WARN]:"warn",[A.ERROR]:"error"},x=(t,e,...n)=>{if(e<t.logLevel)return;const r=(new Date).toISOString(),s=R[e];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);console[s](`[${r}]  ${t.name}:`,...n)};class O{constructor(t){this.name=t,this._logLevel=k,this._logHandler=x,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in A))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel="string"==typeof t?N[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if("function"!=typeof t)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,A.DEBUG,...t),this._logHandler(this,A.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,A.VERBOSE,...t),this._logHandler(this,A.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,A.INFO,...t),this._logHandler(this,A.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,A.WARN,...t),this._logHandler(this,A.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,A.ERROR,...t),this._logHandler(this,A.ERROR,...t)}}let L,M;const V=new WeakMap,P=new WeakMap,F=new WeakMap,U=new WeakMap,B=new WeakMap;let q={get(t,e,n){if(t instanceof IDBTransaction){if("done"===e)return P.get(t);if("objectStoreNames"===e)return t.objectStoreNames||F.get(t);if("store"===e)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return z(t[e])},set:(t,e,n)=>(t[e]=n,!0),has:(t,e)=>t instanceof IDBTransaction&&("done"===e||"store"===e)||e in t};function j(t){return t!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(M||(M=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(t)?function(...e){return t.apply(G(this),e),z(V.get(this))}:function(...e){return z(t.apply(G(this),e))}:function(e,...n){const r=t.call(G(this),e,...n);return F.set(r,e.sort?e.sort():[e]),z(r)}}function $(t){return"function"==typeof t?j(t):(t instanceof IDBTransaction&&function(t){if(P.has(t))return;const e=new Promise((e,n)=>{const r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{e(),r()},i=()=>{n(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});P.set(t,e)}(t),e=t,(L||(L=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(t=>e instanceof t)?new Proxy(t,q):t);var e}function z(t){if(t instanceof IDBRequest)return function(t){const e=new Promise((e,n)=>{const r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{e(z(t.result)),r()},i=()=>{n(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(e=>{e instanceof IDBCursor&&V.set(e,t)}).catch(()=>{}),B.set(e,t),e}(t);if(U.has(t))return U.get(t);const e=$(t);return e!==t&&(U.set(t,e),B.set(e,t)),e}const G=t=>B.get(t);const K=["get","getKey","getAll","getAllKeys","count"],H=["put","add","delete","clear"],Q=new Map;function W(t,e){if(!(t instanceof IDBDatabase)||e in t||"string"!=typeof e)return;if(Q.get(e))return Q.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=H.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!s&&!K.includes(n))return;const i=async function(t,...e){const i=this.transaction(t,s?"readwrite":"readonly");let o=i.store;return r&&(o=o.index(e.shift())),(await Promise.all([o[n](...e),s&&i.done]))[0]};return Q.set(e,i),i}q=(t=>({...t,get:(e,n,r)=>W(e,n)||t.get(e,n,r),has:(e,n)=>!!W(e,n)||t.has(e,n)}))(q);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class X{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(function(t){const e=t.getComponent();return"VERSION"===e?.type}(t)){const e=t.getImmediate();return`${e.library}/${e.version}`}return null}).filter(t=>t).join(" ")}}const Y="@firebase/app",J="0.14.4",Z=new O("@firebase/app"),tt="@firebase/app-compat",et="@firebase/analytics-compat",nt="@firebase/analytics",rt="@firebase/app-check-compat",st="@firebase/app-check",it="@firebase/auth",ot="@firebase/auth-compat",at="@firebase/database",ct="@firebase/data-connect",ut="@firebase/database-compat",ht="@firebase/functions",lt="@firebase/functions-compat",dt="@firebase/installations",ft="@firebase/installations-compat",pt="@firebase/messaging",gt="@firebase/messaging-compat",mt="@firebase/performance",yt="@firebase/performance-compat",vt="@firebase/remote-config",wt="@firebase/remote-config-compat",_t="@firebase/storage",Et="@firebase/storage-compat",bt="@firebase/firestore",Tt="@firebase/ai",It="@firebase/firestore-compat",St="firebase",Ct="[DEFAULT]",At={[Y]:"fire-core",[tt]:"fire-core-compat",[nt]:"fire-analytics",[et]:"fire-analytics-compat",[st]:"fire-app-check",[rt]:"fire-app-check-compat",[it]:"fire-auth",[ot]:"fire-auth-compat",[at]:"fire-rtdb",[ct]:"fire-data-connect",[ut]:"fire-rtdb-compat",[ht]:"fire-fn",[lt]:"fire-fn-compat",[dt]:"fire-iid",[ft]:"fire-iid-compat",[pt]:"fire-fcm",[gt]:"fire-fcm-compat",[mt]:"fire-perf",[yt]:"fire-perf-compat",[vt]:"fire-rc",[wt]:"fire-rc-compat",[_t]:"fire-gcs",[Et]:"fire-gcs-compat",[bt]:"fire-fst",[It]:"fire-fst-compat",[Tt]:"fire-vertex","fire-js":"fire-js",[St]:"fire-js-all"},Dt=new Map,Nt=new Map,kt=new Map;function Rt(t,e){try{t.container.addComponent(e)}catch(n){Z.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function xt(t){const e=t.name;if(kt.has(e))return Z.debug(`There were multiple attempts to register component ${e}.`),!1;kt.set(e,t);for(const n of Dt.values())Rt(n,t);for(const n of Nt.values())Rt(n,t);return!0}function Ot(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Lt(t){return null!=t&&void 0!==t.settings}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt=new v("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Vt{constructor(t,e,n){this._isDeleted=!1,this._options={...t},this._config={...e},this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new T("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw Mt.create("app-deleted",{appName:this._name})}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pt(t,e={}){let n=t;if("object"!=typeof e){e={name:e}}const r={name:Ct,automaticDataCollectionEnabled:!0,...e},s=r.name;if("string"!=typeof s||!s)throw Mt.create("bad-app-name",{appName:String(s)});if(n||(n=u()),!n)throw Mt.create("no-options");const i=Dt.get(s);if(i){if(_(n,i.options)&&_(r,i.config))return i;throw Mt.create("duplicate-app",{appName:s})}const o=new C(s);for(const c of kt.values())o.addComponent(c);const a=new Vt(n,r,o);return Dt.set(s,a),a}function Ft(t=Ct){const e=Dt.get(t);if(!e&&t===Ct&&u())return Pt();if(!e)throw Mt.create("no-app",{appName:t});return e}function Ut(t,e,n){let r=At[t]??t;n&&(r+=`-${n}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const t=[`Unable to register library "${r}" with version "${e}":`];return s&&t.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&t.push("and"),i&&t.push(`version name "${e}" contains illegal characters (whitespace or "/")`),void Z.warn(t.join(" "))}xt(new T(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bt="firebase-heartbeat-store";let qt=null;function jt(){return qt||(qt=function(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),a=z(o);return r&&o.addEventListener("upgradeneeded",t=>{r(z(o.result),t.oldVersion,t.newVersion,z(o.transaction),t)}),n&&o.addEventListener("blocked",t=>n(t.oldVersion,t.newVersion,t)),a.then(t=>{i&&t.addEventListener("close",()=>i()),s&&t.addEventListener("versionchange",t=>s(t.oldVersion,t.newVersion,t))}).catch(()=>{}),a}("firebase-heartbeat-database",1,{upgrade:(t,e)=>{if(0===e)try{t.createObjectStore(Bt)}catch(n){console.warn(n)}}}).catch(t=>{throw Mt.create("idb-open",{originalErrorMessage:t.message})})),qt}async function $t(t,e){try{const n=(await jt()).transaction(Bt,"readwrite"),r=n.objectStore(Bt);await r.put(e,zt(t)),await n.done}catch(n){if(n instanceof y)Z.warn(n.message);else{const t=Mt.create("idb-set",{originalErrorMessage:n?.message});Z.warn(t.message)}}}function zt(t){return`${t.name}!${t.options.appId}`}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new Ht(e),this._heartbeatsCachePromise=this._storage.read().then(t=>(this._heartbeatsCache=t,t))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),e=Kt();if(null==this._heartbeatsCache?.heartbeats&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==this._heartbeatsCache?.heartbeats))return;if(this._heartbeatsCache.lastSentHeartbeatDate===e||this._heartbeatsCache.heartbeats.some(t=>t.date===e))return;if(this._heartbeatsCache.heartbeats.push({date:e,agent:t}),this._heartbeatsCache.heartbeats.length>30){const t=function(t){if(0===t.length)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(t,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){Z.warn(t)}}async getHeartbeatsHeader(){try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==this._heartbeatsCache?.heartbeats||0===this._heartbeatsCache.heartbeats.length)return"";const t=Kt(),{heartbeatsToSend:e,unsentEntries:n}=function(t,e=1024){const n=[];let r=t.slice();for(const s of t){const t=n.find(t=>t.agent===s.agent);if(t){if(t.dates.push(s.date),Qt(n)>e){t.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Qt(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),r=s(JSON.stringify({version:2,heartbeats:e}));return this._heartbeatsCache.lastSentHeartbeatDate=t,n.length>0?(this._heartbeatsCache.heartbeats=n,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(t){return Z.warn(t),""}}}function Kt(){return(new Date).toISOString().substring(0,10)}class Ht{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(t){return!1}}()&&new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(n){e(n)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const t=await async function(t){try{const e=(await jt()).transaction(Bt),n=await e.objectStore(Bt).get(zt(t));return await e.done,n}catch(e){if(e instanceof y)Z.warn(e.message);else{const t=Mt.create("idb-get",{originalErrorMessage:e?.message});Z.warn(t.message)}}}(this.app);return t?.heartbeats?t:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){const e=await this.read();return $t(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??e.lastSentHeartbeatDate,heartbeats:t.heartbeats})}}async add(t){if(await this._canUseIndexedDBPromise){const e=await this.read();return $t(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??e.lastSentHeartbeatDate,heartbeats:[...e.heartbeats,...t.heartbeats]})}}}function Qt(t){return s(JSON.stringify({version:2,heartbeats:t})).length}var Wt;Wt="",xt(new T("platform-logger",t=>new X(t),"PRIVATE")),xt(new T("heartbeat",t=>new Gt(t),"PRIVATE")),Ut(Y,J,Wt),Ut(Y,J,"esm2020"),Ut("fire-js","");var Xt,Yt,Jt="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var t;
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}function n(t,e,n){n||(n=0);const r=Array(16);if("string"==typeof e)for(var s=0;s<16;++s)r[s]=e.charCodeAt(n++)|e.charCodeAt(n++)<<8|e.charCodeAt(n++)<<16|e.charCodeAt(n++)<<24;else for(s=0;s<16;++s)r[s]=e[n++]|e[n++]<<8|e[n++]<<16|e[n++]<<24;e=t.g[0],n=t.g[1],s=t.g[2];let i,o=t.g[3];i=e+(o^n&(s^o))+r[0]+3614090360&4294967295,i=o+(s^(e=n+(i<<7&4294967295|i>>>25))&(n^s))+r[1]+3905402710&4294967295,o=e+(i<<12&4294967295|i>>>20),i=s+(n^o&(e^n))+r[2]+606105819&4294967295,i=n+(e^(s=o+(i<<17&4294967295|i>>>15))&(o^e))+r[3]+3250441966&4294967295,i=e+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[4]+4118548399&4294967295,i=o+(s^(e=n+(i<<7&4294967295|i>>>25))&(n^s))+r[5]+1200080426&4294967295,o=e+(i<<12&4294967295|i>>>20),i=s+(n^o&(e^n))+r[6]+2821735955&4294967295,i=n+(e^(s=o+(i<<17&4294967295|i>>>15))&(o^e))+r[7]+4249261313&4294967295,i=e+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[8]+1770035416&4294967295,i=o+(s^(e=n+(i<<7&4294967295|i>>>25))&(n^s))+r[9]+2336552879&4294967295,o=e+(i<<12&4294967295|i>>>20),i=s+(n^o&(e^n))+r[10]+4294925233&4294967295,i=n+(e^(s=o+(i<<17&4294967295|i>>>15))&(o^e))+r[11]+2304563134&4294967295,i=e+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[12]+1804603682&4294967295,i=o+(s^(e=n+(i<<7&4294967295|i>>>25))&(n^s))+r[13]+4254626195&4294967295,o=e+(i<<12&4294967295|i>>>20),i=s+(n^o&(e^n))+r[14]+2792965006&4294967295,i=n+(e^(s=o+(i<<17&4294967295|i>>>15))&(o^e))+r[15]+1236535329&4294967295,i=e+(s^o&((n=s+(i<<22&4294967295|i>>>10))^s))+r[1]+4129170786&4294967295,i=o+(n^s&((e=n+(i<<5&4294967295|i>>>27))^n))+r[6]+3225465664&4294967295,o=e+(i<<9&4294967295|i>>>23),i=s+(e^n&(o^e))+r[11]+643717713&4294967295,i=n+(o^e&((s=o+(i<<14&4294967295|i>>>18))^o))+r[0]+3921069994&4294967295,i=e+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[5]+3593408605&4294967295,i=o+(n^s&((e=n+(i<<5&4294967295|i>>>27))^n))+r[10]+38016083&4294967295,o=e+(i<<9&4294967295|i>>>23),i=s+(e^n&(o^e))+r[15]+3634488961&4294967295,i=n+(o^e&((s=o+(i<<14&4294967295|i>>>18))^o))+r[4]+3889429448&4294967295,i=e+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[9]+568446438&4294967295,i=o+(n^s&((e=n+(i<<5&4294967295|i>>>27))^n))+r[14]+3275163606&4294967295,o=e+(i<<9&4294967295|i>>>23),i=s+(e^n&(o^e))+r[3]+4107603335&4294967295,i=n+(o^e&((s=o+(i<<14&4294967295|i>>>18))^o))+r[8]+1163531501&4294967295,i=e+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[13]+2850285829&4294967295,i=o+(n^s&((e=n+(i<<5&4294967295|i>>>27))^n))+r[2]+4243563512&4294967295,o=e+(i<<9&4294967295|i>>>23),i=s+(e^n&(o^e))+r[7]+1735328473&4294967295,i=n+(o^e&((s=o+(i<<14&4294967295|i>>>18))^o))+r[12]+2368359562&4294967295,i=e+((n=s+(i<<20&4294967295|i>>>12))^s^o)+r[5]+4294588738&4294967295,i=o+((e=n+(i<<4&4294967295|i>>>28))^n^s)+r[8]+2272392833&4294967295,o=e+(i<<11&4294967295|i>>>21),i=s+(o^e^n)+r[11]+1839030562&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^e)+r[14]+4259657740&4294967295,i=e+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[1]+2763975236&4294967295,i=o+((e=n+(i<<4&4294967295|i>>>28))^n^s)+r[4]+1272893353&4294967295,o=e+(i<<11&4294967295|i>>>21),i=s+(o^e^n)+r[7]+4139469664&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^e)+r[10]+3200236656&4294967295,i=e+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[13]+681279174&4294967295,i=o+((e=n+(i<<4&4294967295|i>>>28))^n^s)+r[0]+3936430074&4294967295,o=e+(i<<11&4294967295|i>>>21),i=s+(o^e^n)+r[3]+3572445317&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^e)+r[6]+76029189&4294967295,i=e+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[9]+3654602809&4294967295,i=o+((e=n+(i<<4&4294967295|i>>>28))^n^s)+r[12]+3873151461&4294967295,o=e+(i<<11&4294967295|i>>>21),i=s+(o^e^n)+r[15]+530742520&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^e)+r[2]+3299628645&4294967295,i=e+(s^((n=s+(i<<23&4294967295|i>>>9))|~o))+r[0]+4096336452&4294967295,i=o+(n^((e=n+(i<<6&4294967295|i>>>26))|~s))+r[7]+1126891415&4294967295,o=e+(i<<10&4294967295|i>>>22),i=s+(e^(o|~n))+r[14]+2878612391&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~e))+r[5]+4237533241&4294967295,i=e+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[12]+1700485571&4294967295,i=o+(n^((e=n+(i<<6&4294967295|i>>>26))|~s))+r[3]+2399980690&4294967295,o=e+(i<<10&4294967295|i>>>22),i=s+(e^(o|~n))+r[10]+4293915773&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~e))+r[1]+2240044497&4294967295,i=e+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[8]+1873313359&4294967295,i=o+(n^((e=n+(i<<6&4294967295|i>>>26))|~s))+r[15]+4264355552&4294967295,o=e+(i<<10&4294967295|i>>>22),i=s+(e^(o|~n))+r[6]+2734768916&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~e))+r[13]+1309151649&4294967295,i=e+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[4]+4149444226&4294967295,i=o+(n^((e=n+(i<<6&4294967295|i>>>26))|~s))+r[11]+3174756917&4294967295,o=e+(i<<10&4294967295|i>>>22),i=s+(e^(o|~n))+r[2]+718787259&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~e))+r[9]+3951481745&4294967295,t.g[0]=t.g[0]+e&4294967295,t.g[1]=t.g[1]+(s+(i<<21&4294967295|i>>>11))&4294967295,t.g[2]=t.g[2]+s&4294967295,t.g[3]=t.g[3]+o&4294967295}function r(t,e){this.h=e;const n=[];let r=!0;for(let s=t.length-1;s>=0;s--){const i=0|t[s];r&&i==e||(n[s]=i,r=!1)}this.g=n}!function(t,e){function n(){}n.prototype=e.prototype,t.F=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.D=function(t,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return e.prototype[n].apply(t,s)}}(e,function(){this.blockSize=-1}),e.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},e.prototype.v=function(t,e){void 0===e&&(e=t.length);const r=e-this.blockSize,s=this.C;let i=this.h,o=0;for(;o<e;){if(0==i)for(;o<=r;)n(this,t,o),o+=this.blockSize;if("string"==typeof t){for(;o<e;)if(s[i++]=t.charCodeAt(o++),i==this.blockSize){n(this,s),i=0;break}}else for(;o<e;)if(s[i++]=t[o++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=e},e.prototype.A=function(){var t=Array((this.h<56?this.blockSize:2*this.blockSize)-this.h);t[0]=128;for(var e=1;e<t.length-8;++e)t[e]=0;e=8*this.o;for(var n=t.length-8;n<t.length;++n)t[n]=255&e,e/=256;for(this.v(t),t=Array(16),e=0,n=0;n<4;++n)for(let r=0;r<32;r+=8)t[e++]=this.g[n]>>>r&255;return t};var s={};function i(t){return-128<=t&&t<128?function(t,e){var n=s;return Object.prototype.hasOwnProperty.call(n,t)?n[t]:n[t]=e(t)}(t,function(t){return new r([0|t],t<0?-1:0)}):new r([0|t],t<0?-1:0)}function o(t){if(isNaN(t)||!isFinite(t))return a;if(t<0)return d(o(-t));const e=[];let n=1;for(let r=0;t>=n;r++)e[r]=t/n|0,n*=4294967296;return new r(e,0)}var a=i(0),c=i(1),u=i(16777216);function h(t){if(0!=t.h)return!1;for(let e=0;e<t.g.length;e++)if(0!=t.g[e])return!1;return!0}function l(t){return-1==t.h}function d(t){const e=t.g.length,n=[];for(let r=0;r<e;r++)n[r]=~t.g[r];return new r(n,~t.h).add(c)}function f(t,e){return t.add(d(e))}function p(t,e){for(;(65535&t[e])!=t[e];)t[e+1]+=t[e]>>>16,t[e]&=65535,e++}function g(t,e){this.g=t,this.h=e}function m(t,e){if(h(e))throw Error("division by zero");if(h(t))return new g(a,a);if(l(t))return e=m(d(t),e),new g(d(e.g),d(e.h));if(l(e))return e=m(t,d(e)),new g(d(e.g),e.h);if(t.g.length>30){if(l(t)||l(e))throw Error("slowDivide_ only works with positive integers.");for(var n=c,r=e;r.l(t)<=0;)n=y(n),r=y(r);var s=v(n,1),i=v(r,1);for(r=v(r,2),n=v(n,2);!h(r);){var u=i.add(r);u.l(t)<=0&&(s=s.add(n),i=u),r=v(r,1),n=v(n,1)}return e=f(t,s.j(e)),new g(s,e)}for(s=a;t.l(e)>=0;){for(n=Math.max(1,Math.floor(t.m()/e.m())),r=(r=Math.ceil(Math.log(n)/Math.LN2))<=48?1:Math.pow(2,r-48),u=(i=o(n)).j(e);l(u)||u.l(t)>0;)u=(i=o(n-=r)).j(e);h(i)&&(i=c),s=s.add(i),t=f(t,u)}return new g(s,t)}function y(t){const e=t.g.length+1,n=[];for(let r=0;r<e;r++)n[r]=t.i(r)<<1|t.i(r-1)>>>31;return new r(n,t.h)}function v(t,e){const n=e>>5;e%=32;const s=t.g.length-n,i=[];for(let r=0;r<s;r++)i[r]=e>0?t.i(r+n)>>>e|t.i(r+n+1)<<32-e:t.i(r+n);return new r(i,t.h)}(t=r.prototype).m=function(){if(l(this))return-d(this).m();let t=0,e=1;for(let n=0;n<this.g.length;n++){const r=this.i(n);t+=(r>=0?r:4294967296+r)*e,e*=4294967296}return t},t.toString=function(t){if((t=t||10)<2||36<t)throw Error("radix out of range: "+t);if(h(this))return"0";if(l(this))return"-"+d(this).toString(t);const e=o(Math.pow(t,6));var n=this;let r="";for(;;){const s=m(n,e).g;let i=(((n=f(n,s.j(e))).g.length>0?n.g[0]:n.h)>>>0).toString(t);if(h(n=s))return i+r;for(;i.length<6;)i="0"+i;r=i+r}},t.i=function(t){return t<0?0:t<this.g.length?this.g[t]:this.h},t.l=function(t){return l(t=f(this,t))?-1:h(t)?0:1},t.abs=function(){return l(this)?d(this):this},t.add=function(t){const e=Math.max(this.g.length,t.g.length),n=[];let s=0;for(let r=0;r<=e;r++){let e=s+(65535&this.i(r))+(65535&t.i(r)),i=(e>>>16)+(this.i(r)>>>16)+(t.i(r)>>>16);s=i>>>16,e&=65535,i&=65535,n[r]=i<<16|e}return new r(n,-2147483648&n[n.length-1]?-1:0)},t.j=function(t){if(h(this)||h(t))return a;if(l(this))return l(t)?d(this).j(d(t)):d(d(this).j(t));if(l(t))return d(this.j(d(t)));if(this.l(u)<0&&t.l(u)<0)return o(this.m()*t.m());const e=this.g.length+t.g.length,n=[];for(var s=0;s<2*e;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(let e=0;e<t.g.length;e++){const r=this.i(s)>>>16,i=65535&this.i(s),o=t.i(e)>>>16,a=65535&t.i(e);n[2*s+2*e]+=i*a,p(n,2*s+2*e),n[2*s+2*e+1]+=r*a,p(n,2*s+2*e+1),n[2*s+2*e+1]+=i*o,p(n,2*s+2*e+1),n[2*s+2*e+2]+=r*o,p(n,2*s+2*e+2)}for(t=0;t<e;t++)n[t]=n[2*t+1]<<16|n[2*t];for(t=e;t<2*e;t++)n[t]=0;return new r(n,0)},t.B=function(t){return m(this,t).h},t.and=function(t){const e=Math.max(this.g.length,t.g.length),n=[];for(let r=0;r<e;r++)n[r]=this.i(r)&t.i(r);return new r(n,this.h&t.h)},t.or=function(t){const e=Math.max(this.g.length,t.g.length),n=[];for(let r=0;r<e;r++)n[r]=this.i(r)|t.i(r);return new r(n,this.h|t.h)},t.xor=function(t){const e=Math.max(this.g.length,t.g.length),n=[];for(let r=0;r<e;r++)n[r]=this.i(r)^t.i(r);return new r(n,this.h^t.h)},e.prototype.digest=e.prototype.A,e.prototype.reset=e.prototype.u,e.prototype.update=e.prototype.v,Yt=e,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.B,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=o,r.fromString=function t(e,n){if(0==e.length)throw Error("number format error: empty string");if((n=n||10)<2||36<n)throw Error("radix out of range: "+n);if("-"==e.charAt(0))return d(t(e.substring(1),n));if(e.indexOf("-")>=0)throw Error('number format error: interior "-" character');const r=o(Math.pow(n,8));let s=a;for(let a=0;a<e.length;a+=8){var i=Math.min(8,e.length-a);const t=parseInt(e.substring(a,a+i),n);i<8?(i=o(Math.pow(n,i)),s=s.j(i).add(o(t))):(s=s.j(r),s=s.add(o(t)))}return s},Xt=r}).apply(void 0!==Jt?Jt:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var Zt,te,ee,ne,re,se,ie,oe,ae="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var t,e=Object.defineProperty;var n=function(t){t=["object"==typeof globalThis&&globalThis,t,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof ae&&ae];for(var e=0;e<t.length;++e){var n=t[e];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);function r(t,r){if(r)t:{var s=n;t=t.split(".");for(var i=0;i<t.length-1;i++){var o=t[i];if(!(o in s))break t;s=s[o]}(r=r(i=s[t=t[t.length-1]]))!=i&&null!=r&&e(s,t,{configurable:!0,writable:!0,value:r})}}r("Symbol.dispose",function(t){return t||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(t){return t||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(t){return t||function(t){var e,n=[];for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.push([e,t[e]]);return n}});
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
var s=s||{},i=this||self;function o(t){var e=typeof t;return"object"==e&&null!=t||"function"==e}function a(t,e,n){return t.call.apply(t.bind,arguments)}function c(t,e,n){return(c=a).apply(null,arguments)}function u(t,e){var n=Array.prototype.slice.call(arguments,1);return function(){var e=n.slice();return e.push.apply(e,arguments),t.apply(this,e)}}function h(t,e){function n(){}n.prototype=e.prototype,t.Z=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.Ob=function(t,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return e.prototype[n].apply(t,s)}}var l="undefined"!=typeof AsyncContext&&"function"==typeof AsyncContext.Snapshot?t=>t&&AsyncContext.Snapshot.wrap(t):t=>t;function d(t){const e=t.length;if(e>0){const n=Array(e);for(let r=0;r<e;r++)n[r]=t[r];return n}return[]}function f(t,e){for(let r=1;r<arguments.length;r++){const e=arguments[r];var n=typeof e;if("array"==(n="object"!=n?n:e?Array.isArray(e)?"array":n:"null")||"object"==n&&"number"==typeof e.length){n=t.length||0;const r=e.length||0;t.length=n+r;for(let s=0;s<r;s++)t[n+s]=e[s]}else t.push(e)}}function p(t){i.setTimeout(()=>{throw t},0)}function g(){var t=_;let e=null;return t.g&&(e=t.g,t.g=t.g.next,t.g||(t.h=null),e.next=null),e}var m=new class{constructor(t,e){this.i=t,this.j=e,this.h=0,this.g=null}get(){let t;return this.h>0?(this.h--,t=this.g,this.g=t.next,t.next=null):t=this.i(),t}}(()=>new y,t=>t.reset());class y{constructor(){this.next=this.g=this.h=null}set(t,e){this.h=t,this.g=e,this.next=null}reset(){this.next=this.g=this.h=null}}let v,w=!1,_=new class{constructor(){this.h=this.g=null}add(t,e){const n=m.get();n.set(t,e),this.h?this.h.next=n:this.g=n,this.h=n}},E=()=>{const t=Promise.resolve(void 0);v=()=>{t.then(b)}};function b(){for(var t;t=g();){try{t.h.call(t.g)}catch(n){p(n)}var e=m;e.j(t),e.h<100&&(e.h++,t.next=e.g,e.g=t)}w=!1}function T(){this.u=this.u,this.C=this.C}function I(t,e){this.type=t,this.g=this.target=e,this.defaultPrevented=!1}T.prototype.u=!1,T.prototype.dispose=function(){this.u||(this.u=!0,this.N())},T.prototype[Symbol.dispose]=function(){this.dispose()},T.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},I.prototype.h=function(){this.defaultPrevented=!0};var S=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var t=!1,e=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const t=()=>{};i.addEventListener("test",t,e),i.removeEventListener("test",t,e)}catch(n){}return t}();function C(t){return/^[\s\xa0]*$/.test(t)}function A(t,e){I.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t&&this.init(t,e)}h(A,I),A.prototype.init=function(t,e){const n=this.type=t.type,r=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;this.target=t.target||t.srcElement,this.g=e,(e=t.relatedTarget)||("mouseover"==n?e=t.fromElement:"mouseout"==n&&(e=t.toElement)),this.relatedTarget=e,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==t.clientX?t.clientX:t.pageX,this.clientY=void 0!==t.clientY?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=t.pointerType,this.state=t.state,this.i=t,t.defaultPrevented&&A.Z.h.call(this)},A.prototype.h=function(){A.Z.h.call(this);const t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var D="closure_listenable_"+(1e6*Math.random()|0),N=0;function k(t,e,n,r,s){this.listener=t,this.proxy=null,this.src=e,this.type=n,this.capture=!!r,this.ha=s,this.key=++N,this.da=this.fa=!1}function R(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function x(t,e,n){for(const r in t)e.call(n,t[r],r,t)}function O(t){const e={};for(const n in t)e[n]=t[n];return e}const L="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function M(t,e){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)t[n]=r[n];for(let e=0;e<L.length;e++)n=L[e],Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n])}}function V(t){this.src=t,this.g={},this.h=0}function P(t,e){const n=e.type;if(n in t.g){var r,s=t.g[n],i=Array.prototype.indexOf.call(s,e,void 0);(r=i>=0)&&Array.prototype.splice.call(s,i,1),r&&(R(e),0==t.g[n].length&&(delete t.g[n],t.h--))}}function F(t,e,n,r){for(let s=0;s<t.length;++s){const i=t[s];if(!i.da&&i.listener==e&&i.capture==!!n&&i.ha==r)return s}return-1}V.prototype.add=function(t,e,n,r,s){const i=t.toString();(t=this.g[i])||(t=this.g[i]=[],this.h++);const o=F(t,e,r,s);return o>-1?(e=t[o],n||(e.fa=!1)):((e=new k(e,this.src,i,!!r,s)).fa=n,t.push(e)),e};var U="closure_lm_"+(1e6*Math.random()|0),B={};function q(t,e,n,r,s){if(Array.isArray(e)){for(let i=0;i<e.length;i++)q(t,e[i],n,r,s);return null}return n=Q(n),t&&t[D]?t.J(e,n,!!o(r)&&!!r.capture,s):function(t,e,n,r,s,i){if(!e)throw Error("Invalid event type");const a=o(s)?!!s.capture:!!s;let c=K(t);if(c||(t[U]=c=new V(t)),n=c.add(e,n,r,a,i),n.proxy)return n;if(r=function(){function t(n){return e.call(t.src,t.listener,n)}const e=G;return t}(),n.proxy=r,r.src=t,r.listener=n,t.addEventListener)S||(s=a),void 0===s&&(s=!1),t.addEventListener(e.toString(),r,s);else if(t.attachEvent)t.attachEvent(z(e.toString()),r);else{if(!t.addListener||!t.removeListener)throw Error("addEventListener and attachEvent are unavailable.");t.addListener(r)}return n}(t,e,n,!1,r,s)}function j(t,e,n,r,s){if(Array.isArray(e))for(var i=0;i<e.length;i++)j(t,e[i],n,r,s);else r=o(r)?!!r.capture:!!r,n=Q(n),t&&t[D]?(t=t.i,(i=String(e).toString())in t.g&&((n=F(e=t.g[i],n,r,s))>-1&&(R(e[n]),Array.prototype.splice.call(e,n,1),0==e.length&&(delete t.g[i],t.h--)))):t&&(t=K(t))&&(e=t.g[e.toString()],t=-1,e&&(t=F(e,n,r,s)),(n=t>-1?e[t]:null)&&$(n))}function $(t){if("number"!=typeof t&&t&&!t.da){var e=t.src;if(e&&e[D])P(e.i,t);else{var n=t.type,r=t.proxy;e.removeEventListener?e.removeEventListener(n,r,t.capture):e.detachEvent?e.detachEvent(z(n),r):e.addListener&&e.removeListener&&e.removeListener(r),(n=K(e))?(P(n,t),0==n.h&&(n.src=null,e[U]=null)):R(t)}}}function z(t){return t in B?B[t]:B[t]="on"+t}function G(t,e){if(t.da)t=!0;else{e=new A(e,this);const n=t.listener,r=t.ha||t.src;t.fa&&$(t),t=n.call(r,e)}return t}function K(t){return(t=t[U])instanceof V?t:null}var H="__closure_events_fn_"+(1e9*Math.random()>>>0);function Q(t){return"function"==typeof t?t:(t[H]||(t[H]=function(e){return t.handleEvent(e)}),t[H])}function W(){T.call(this),this.i=new V(this),this.M=this,this.G=null}function X(t,e){var n,r=t.G;if(r)for(n=[];r;r=r.G)n.push(r);if(t=t.M,r=e.type||e,"string"==typeof e)e=new I(e,t);else if(e instanceof I)e.target=e.target||t;else{var s=e;M(e=new I(r,t),s)}let i,o;if(s=!0,n)for(o=n.length-1;o>=0;o--)i=e.g=n[o],s=Y(i,r,!0,e)&&s;if(i=e.g=t,s=Y(i,r,!0,e)&&s,s=Y(i,r,!1,e)&&s,n)for(o=0;o<n.length;o++)i=e.g=n[o],s=Y(i,r,!1,e)&&s}function Y(t,e,n,r){if(!(e=t.i.g[String(e)]))return!0;e=e.concat();let s=!0;for(let i=0;i<e.length;++i){const o=e[i];if(o&&!o.da&&o.capture==n){const e=o.listener,n=o.ha||o.src;o.fa&&P(t.i,o),s=!1!==e.call(n,r)&&s}}return s&&!r.defaultPrevented}function J(t){t.g=function(t,e){if("function"!=typeof t){if(!t||"function"!=typeof t.handleEvent)throw Error("Invalid listener argument");t=c(t.handleEvent,t)}return Number(e)>2147483647?-1:i.setTimeout(t,e||0)}(()=>{t.g=null,t.i&&(t.i=!1,J(t))},t.l);const e=t.h;t.h=null,t.m.apply(null,e)}h(W,T),W.prototype[D]=!0,W.prototype.removeEventListener=function(t,e,n,r){j(this,t,e,n,r)},W.prototype.N=function(){if(W.Z.N.call(this),this.i){var t=this.i;for(const e in t.g){const n=t.g[e];for(let t=0;t<n.length;t++)R(n[t]);delete t.g[e],t.h--}}this.G=null},W.prototype.J=function(t,e,n,r){return this.i.add(String(t),e,!1,n,r)},W.prototype.K=function(t,e,n,r){return this.i.add(String(t),e,!0,n,r)};class Z extends T{constructor(t,e){super(),this.m=t,this.l=e,this.h=null,this.i=!1,this.g=null}j(t){this.h=arguments,this.g?this.i=!0:J(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function tt(t){T.call(this),this.h=t,this.g={}}h(tt,T);var et=[];function nt(t){x(t.g,function(t,e){this.g.hasOwnProperty(e)&&$(t)},t),t.g={}}tt.prototype.N=function(){tt.Z.N.call(this),nt(this)},tt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rt=i.JSON.stringify,st=i.JSON.parse,it=class{stringify(t){return i.JSON.stringify(t,void 0)}parse(t){return i.JSON.parse(t,void 0)}};function ot(){}function at(){}var ct={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ut(){I.call(this,"d")}function ht(){I.call(this,"c")}h(ut,I),h(ht,I);var lt={},dt=null;function ft(){return dt=dt||new W}function pt(t){I.call(this,lt.Ia,t)}function gt(t){const e=ft();X(e,new pt(e))}function mt(t,e){I.call(this,lt.STAT_EVENT,t),this.stat=e}function yt(t){const e=ft();X(e,new mt(e,t))}function vt(t,e){I.call(this,lt.Ja,t),this.size=e}function wt(t,e){if("function"!=typeof t)throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){t()},e)}function _t(){this.g=!0}function Et(t,e,n,r){t.info(function(){return"XMLHTTP TEXT ("+e+"): "+function(t,e){if(!t.g)return e;if(!e)return null;try{const i=JSON.parse(e);if(i)for(t=0;t<i.length;t++)if(Array.isArray(i[t])){var n=i[t];if(!(n.length<2)){var r=n[1];if(Array.isArray(r)&&!(r.length<1)){var s=r[0];if("noop"!=s&&"stop"!=s&&"close"!=s)for(let t=1;t<r.length;t++)r[t]=""}}}return rt(i)}catch(i){return e}}(t,n)+(r?" "+r:"")})}lt.Ia="serverreachability",h(pt,I),lt.STAT_EVENT="statevent",h(mt,I),lt.Ja="timingevent",h(vt,I),_t.prototype.ua=function(){this.g=!1},_t.prototype.info=function(){};var bt,Tt={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},It={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"};function St(){}function Ct(t){return encodeURIComponent(String(t))}function At(t){var e=1;t=t.split(":");const n=[];for(;e>0&&t.length;)n.push(t.shift()),e--;return t.length&&n.push(t.join(":")),n}function Dt(t,e,n,r){this.j=t,this.i=e,this.l=n,this.S=r||1,this.V=new tt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Nt}function Nt(){this.i=null,this.g="",this.h=!1}h(St,ot),St.prototype.g=function(){return new XMLHttpRequest},bt=new St;var kt={},Rt={};function xt(t,e,n){t.M=1,t.A=de(Jt(e)),t.u=n,t.R=!0,Ot(t,null)}function Ot(t,e){t.F=Date.now(),Vt(t),t.B=Jt(t.A);var n=t.B,r=t.S;Array.isArray(r)||(r=[String(r)]),Ce(n.i,"t",r),t.C=0,n=t.j.L,t.h=new Nt,t.g=fn(t.j,n?e:null,!t.u),t.P>0&&(t.O=new Z(c(t.Y,t,t.g),t.P)),e=t.V,n=t.g,r=t.ba;var s="readystatechange";Array.isArray(s)||(s&&(et[0]=s.toString()),s=et);for(let i=0;i<s.length;i++){const t=q(n,s[i],r||e.handleEvent,!1,e.h||e);if(!t)break;e.g[t.key]=t}e=t.J?O(t.J):{},t.u?(t.v||(t.v="POST"),e["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.B,t.v,t.u,e)):(t.v="GET",t.g.ea(t.B,t.v,null,e)),gt(),function(t,e,n,r,s,i){t.info(function(){if(t.g)if(i){var o="",a=i.split("&");for(let t=0;t<a.length;t++){var c=a[t].split("=");if(c.length>1){const t=c[0];c=c[1];const e=t.split("_");o=e.length>=2&&"type"==e[1]?o+(t+"=")+c+"&":o+(t+"=redacted&")}}}else o=null;else o=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+e+"\n"+n+"\n"+o})}(t.i,t.v,t.B,t.l,t.S,t.u)}function Lt(t){return!!t.g&&("GET"==t.v&&2!=t.M&&t.j.Aa)}function Mt(t,e){var n=t.C,r=e.indexOf("\n",n);return-1==r?Rt:(n=Number(e.substring(n,r)),isNaN(n)?kt:(r+=1)+n>e.length?Rt:(e=e.slice(r,r+n),t.C=r+n,e))}function Vt(t){t.T=Date.now()+t.H,Pt(t,t.H)}function Pt(t,e){if(null!=t.D)throw Error("WatchDog timer not null");t.D=wt(c(t.aa,t),e)}function Ft(t){t.D&&(i.clearTimeout(t.D),t.D=null)}function Ut(t){0==t.j.I||t.K||cn(t.j,t)}function Bt(t){Ft(t);var e=t.O;e&&"function"==typeof e.dispose&&e.dispose(),t.O=null,nt(t.V),t.g&&(e=t.g,t.g=null,e.abort(),e.dispose())}function qt(t,e){try{var n=t.j;if(0!=n.I&&(n.g==t||Kt(n.h,t)))if(!t.L&&Kt(n.h,t)&&3==n.I){try{var r=n.Ba.g.parse(e)}catch(h){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){t:if(!n.v){if(n.g){if(!(n.g.F+3e3<t.F))break t;an(n),Xe(n)}rn(n),yt(18)}}else n.xa=s[1],0<n.xa-n.K&&s[2]<37500&&n.F&&0==n.A&&!n.C&&(n.C=wt(c(n.Va,n),6e3));Gt(n.h)<=1&&n.ta&&(n.ta=void 0)}else hn(n,11)}else if((t.L||n.g==t)&&an(n),!C(e))for(s=n.Ba.g.parse(e),e=0;e<s.length;e++){let c=s[e];const h=c[0];if(!(h<=n.K))if(n.K=h,c=c[1],2==n.I)if("c"==c[0]){n.M=c[1],n.ba=c[2];const e=c[3];null!=e&&(n.ka=e,n.j.info("VER="+n.ka));const s=c[4];null!=s&&(n.za=s,n.j.info("SVER="+n.za));const h=c[5];null!=h&&"number"==typeof h&&h>0&&(r=1.5*h,n.O=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const l=t.g;if(l){const t=l.g?l.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(t){var i=r.h;i.g||-1==t.indexOf("spdy")&&-1==t.indexOf("quic")&&-1==t.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(Ht(i,i.h),i.h=null))}if(r.G){const t=l.g?l.g.getResponseHeader("X-HTTP-Session-Id"):null;t&&(r.wa=t,le(r.J,r.G,t))}}n.I=3,n.l&&n.l.ra(),n.aa&&(n.T=Date.now()-t.F,n.j.info("Handshake RTT: "+n.T+"ms"));var o=t;if((r=n).na=dn(r,r.L?r.ba:null,r.W),o.L){Qt(r.h,o);var a=o,u=r.O;u&&(a.H=u),a.D&&(Ft(a),Vt(a)),r.g=o}else nn(r);n.i.length>0&&Je(n)}else"stop"!=c[0]&&"close"!=c[0]||hn(n,7);else 3==n.I&&("stop"==c[0]||"close"==c[0]?"stop"==c[0]?hn(n,7):We(n):"noop"!=c[0]&&n.l&&n.l.qa(c),n.A=0)}gt()}catch(h){}}Dt.prototype.ba=function(t){t=t.target;const e=this.O;e&&3==Ge(t)?e.j():this.Y(t)},Dt.prototype.Y=function(t){try{if(t==this.g)t:{const c=Ge(this.g),u=this.g.ya();this.g.ca();if(!(c<3)&&(3!=c||this.g&&(this.h.h||this.g.la()||Ke(this.g)))){this.K||4!=c||7==u||gt(),Ft(this);var e=this.g.ca();this.X=e;var n=function(t){if(!Lt(t))return t.g.la();const e=Ke(t.g);if(""===e)return"";let n="";const r=e.length,s=4==Ge(t.g);if(!t.h.i){if("undefined"==typeof TextDecoder)return Bt(t),Ut(t),"";t.h.i=new i.TextDecoder}for(let i=0;i<r;i++)t.h.h=!0,n+=t.h.i.decode(e[i],{stream:!(s&&i==r-1)});return e.length=0,t.h.g+=n,t.C=0,t.h.g}(this);if(this.o=200==e,function(t,e,n,r,s,i,o){t.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+e+"\n"+n+"\n"+i+" "+o})}(this.i,this.v,this.B,this.l,this.S,c,e),this.o){if(this.U&&!this.L){e:{if(this.g){var r,s=this.g;if((r=s.g?s.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!C(r)){var o=r;break e}}o=null}if(!(t=o)){this.o=!1,this.m=3,yt(12),Bt(this),Ut(this);break t}Et(this.i,this.l,t,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,qt(this,t)}if(this.R){let e;for(t=!0;!this.K&&this.C<n.length;){if(e=Mt(this,n),e==Rt){4==c&&(this.m=4,yt(14),t=!1),Et(this.i,this.l,null,"[Incomplete Response]");break}if(e==kt){this.m=4,yt(15),Et(this.i,this.l,n,"[Invalid Chunk]"),t=!1;break}Et(this.i,this.l,e,null),qt(this,e)}if(Lt(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=c||0!=n.length||this.h.h||(this.m=1,yt(16),t=!1),this.o=this.o&&t,t){if(n.length>0&&!this.W){this.W=!0;var a=this.j;a.g==this&&a.aa&&!a.P&&(a.j.info("Great, no buffering proxy detected. Bytes received: "+n.length),sn(a),a.P=!0,yt(11))}}else Et(this.i,this.l,n,"[Invalid Chunked Response]"),Bt(this),Ut(this)}else Et(this.i,this.l,n,null),qt(this,n);4==c&&Bt(this),this.o&&!this.K&&(4==c?cn(this.j,this):(this.o=!1,Vt(this)))}else(function(t){const e={};t=(t.g&&Ge(t)>=2&&t.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<t.length;r++){if(C(t[r]))continue;var n=At(t[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=e[s]||[];e[s]=i,i.push(n)}!function(t,e){for(const n in t)e.call(void 0,t[n],n,t)}(e,function(t){return t.join(", ")})})(this.g),400==e&&n.indexOf("Unknown SID")>0?(this.m=3,yt(12)):(this.m=0,yt(13)),Bt(this),Ut(this)}}}catch(c){}},Dt.prototype.cancel=function(){this.K=!0,Bt(this)},Dt.prototype.aa=function(){this.D=null;const t=Date.now();t-this.T>=0?(function(t,e){t.info(function(){return"TIMEOUT: "+e})}(this.i,this.B),2!=this.M&&(gt(),yt(17)),Bt(this),this.m=2,Ut(this)):Pt(this,this.T-t)};var jt=class{constructor(t,e){this.g=t,this.map=e}};function $t(t){this.l=t||10,i.PerformanceNavigationTiming?t=(t=i.performance.getEntriesByType("navigation")).length>0&&("hq"==t[0].nextHopProtocol||"h2"==t[0].nextHopProtocol):t=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function zt(t){return!!t.h||!!t.g&&t.g.size>=t.j}function Gt(t){return t.h?1:t.g?t.g.size:0}function Kt(t,e){return t.h?t.h==e:!!t.g&&t.g.has(e)}function Ht(t,e){t.g?t.g.add(e):t.h=e}function Qt(t,e){t.h&&t.h==e?t.h=null:t.g&&t.g.has(e)&&t.g.delete(e)}function Wt(t){if(null!=t.h)return t.i.concat(t.h.G);if(null!=t.g&&0!==t.g.size){let e=t.i;for(const n of t.g.values())e=e.concat(n.G);return e}return d(t.i)}$t.prototype.cancel=function(){if(this.i=Wt(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const t of this.g.values())t.cancel();this.g.clear()}};var Xt=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Yt(t){let e;this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1,t instanceof Yt?(this.l=t.l,ce(this,t.j),this.o=t.o,this.g=t.g,ue(this,t.u),this.h=t.h,he(this,Ae(t.i)),this.m=t.m):t&&(e=String(t).match(Xt))?(this.l=!1,ce(this,e[1]||"",!0),this.o=fe(e[2]||""),this.g=fe(e[3]||"",!0),ue(this,e[4]),this.h=fe(e[5]||"",!0),he(this,e[6]||"",!0),this.m=fe(e[7]||"")):(this.l=!1,this.i=new Ee(null,this.l))}function Jt(t){return new Yt(t)}function ce(t,e,n){t.j=n?fe(e,!0):e,t.j&&(t.j=t.j.replace(/:$/,""))}function ue(t,e){if(e){if(e=Number(e),isNaN(e)||e<0)throw Error("Bad port number "+e);t.u=e}else t.u=null}function he(t,e,n){e instanceof Ee?(t.i=e,function(t,e){e&&!t.j&&(be(t),t.i=null,t.g.forEach(function(t,e){const n=e.toLowerCase();e!=n&&(Te(this,e),Ce(this,n,t))},t)),t.j=e}(t.i,t.l)):(n||(e=pe(e,we)),t.i=new Ee(e,t.l))}function le(t,e,n){t.i.set(e,n)}function de(t){return le(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function fe(t,e){return t?e?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function pe(t,e,n){return"string"==typeof t?(t=encodeURI(t).replace(e,ge),n&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function ge(t){return"%"+((t=t.charCodeAt(0))>>4&15).toString(16)+(15&t).toString(16)}Yt.prototype.toString=function(){const t=[];var e=this.j;e&&t.push(pe(e,me,!0),":");var n=this.g;return(n||"file"==e)&&(t.push("//"),(e=this.o)&&t.push(pe(e,me,!0),"@"),t.push(Ct(n).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.u)&&t.push(":",String(n))),(n=this.h)&&(this.g&&"/"!=n.charAt(0)&&t.push("/"),t.push(pe(n,"/"==n.charAt(0)?ve:ye,!0))),(n=this.i.toString())&&t.push("?",n),(n=this.m)&&t.push("#",pe(n,_e)),t.join("")},Yt.prototype.resolve=function(t){const e=Jt(this);let n=!!t.j;n?ce(e,t.j):n=!!t.o,n?e.o=t.o:n=!!t.g,n?e.g=t.g:n=null!=t.u;var r=t.h;if(n)ue(e,t.u);else if(n=!!t.h){if("/"!=r.charAt(0))if(this.g&&!this.h)r="/"+r;else{var s=e.h.lastIndexOf("/");-1!=s&&(r=e.h.slice(0,s+1)+r)}if(".."==(s=r)||"."==s)r="";else if(-1!=s.indexOf("./")||-1!=s.indexOf("/.")){r=0==s.lastIndexOf("/",0),s=s.split("/");const t=[];for(let e=0;e<s.length;){const n=s[e++];"."==n?r&&e==s.length&&t.push(""):".."==n?((t.length>1||1==t.length&&""!=t[0])&&t.pop(),r&&e==s.length&&t.push("")):(t.push(n),r=!0)}r=t.join("/")}else r=s}return n?e.h=r:n=""!==t.i.toString(),n?he(e,Ae(t.i)):n=!!t.m,n&&(e.m=t.m),e};var me=/[#\/\?@]/g,ye=/[#\?:]/g,ve=/[#\?]/g,we=/[#\?@]/g,_e=/#/g;function Ee(t,e){this.h=this.g=null,this.i=t||null,this.j=!!e}function be(t){t.g||(t.g=new Map,t.h=0,t.i&&function(t,e){if(t){t=t.split("&");for(let n=0;n<t.length;n++){const r=t[n].indexOf("=");let s,i=null;r>=0?(s=t[n].substring(0,r),i=t[n].substring(r+1)):s=t[n],e(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}(t.i,function(e,n){t.add(decodeURIComponent(e.replace(/\+/g," ")),n)}))}function Te(t,e){be(t),e=De(t,e),t.g.has(e)&&(t.i=null,t.h-=t.g.get(e).length,t.g.delete(e))}function Ie(t,e){return be(t),e=De(t,e),t.g.has(e)}function Se(t,e){be(t);let n=[];if("string"==typeof e)Ie(t,e)&&(n=n.concat(t.g.get(De(t,e))));else for(t=Array.from(t.g.values()),e=0;e<t.length;e++)n=n.concat(t[e]);return n}function Ce(t,e,n){Te(t,e),n.length>0&&(t.i=null,t.g.set(De(t,e),d(n)),t.h+=n.length)}function Ae(t){const e=new Ee;return e.i=t.i,t.g&&(e.g=new Map(t.g),e.h=t.h),e}function De(t,e){return e=String(e),t.j&&(e=e.toLowerCase()),e}function Ne(t,e,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function ke(){this.g=new it}function Re(t){this.i=t.Sb||null,this.h=t.ab||!1}function xe(t,e){W.call(this),this.H=t,this.o=e,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}function Oe(t){t.j.read().then(t.Ma.bind(t)).catch(t.ga.bind(t))}function Le(t){t.readyState=4,t.l=null,t.j=null,t.B=null,Me(t)}function Me(t){t.onreadystatechange&&t.onreadystatechange.call(t)}function Ve(t){let e="";return x(t,function(t,n){e+=n,e+=":",e+=t,e+="\r\n"}),e}function Pe(t,e,n){t:{for(r in n){var r=!1;break t}r=!0}r||(n=Ve(n),"string"==typeof t?null!=n&&Ct(n):le(t,e,n))}function Fe(t){W.call(this),this.headers=new Map,this.L=t||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}(t=Ee.prototype).add=function(t,e){be(this),this.i=null,t=De(this,t);let n=this.g.get(t);return n||this.g.set(t,n=[]),n.push(e),this.h+=1,this},t.forEach=function(t,e){be(this),this.g.forEach(function(n,r){n.forEach(function(n){t.call(e,n,r,this)},this)},this)},t.set=function(t,e){return be(this),this.i=null,Ie(this,t=De(this,t))&&(this.h-=this.g.get(t).length),this.g.set(t,[e]),this.h+=1,this},t.get=function(t,e){return t&&(t=Se(this,t)).length>0?String(t[0]):e},t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],e=Array.from(this.g.keys());for(let r=0;r<e.length;r++){var n=e[r];const s=Ct(n);n=Se(this,n);for(let e=0;e<n.length;e++){let r=s;""!==n[e]&&(r+="="+Ct(n[e])),t.push(r)}}return this.i=t.join("&")},h(Re,ot),Re.prototype.g=function(){return new xe(this.i,this.h)},h(xe,W),(t=xe.prototype).open=function(t,e){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.F=t,this.D=e,this.readyState=1,Me(this)},t.send=function(t){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const e={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};t&&(e.body=t),(this.H||i).fetch(new Request(this.D,e)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&4!=this.readyState&&(this.g=!1,Le(this)),this.readyState=0},t.Pa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Me(this)),this.g&&(this.readyState=3,Me(this),this.g)))if("arraybuffer"===this.responseType)t.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(void 0!==i.ReadableStream&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Oe(this)}else t.text().then(this.Oa.bind(this),this.ga.bind(this))},t.Ma=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var e=t.value?t.value:new Uint8Array(0);(e=this.B.decode(e,{stream:!t.done}))&&(this.response=this.responseText+=e)}t.done?Le(this):Me(this),3==this.readyState&&Oe(this)}},t.Oa=function(t){this.g&&(this.response=this.responseText=t,Le(this))},t.Na=function(t){this.g&&(this.response=t,Le(this))},t.ga=function(){this.g&&Le(this)},t.setRequestHeader=function(t,e){this.A.append(t,e)},t.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],e=this.h.entries();for(var n=e.next();!n.done;)n=n.value,t.push(n[0]+": "+n[1]),n=e.next();return t.join("\r\n")},Object.defineProperty(xe.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(t){this.m=t?"include":"same-origin"}}),h(Fe,W);var Ue=/^https?$/i,Be=["POST","PUT"];function qe(t,e){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=e,t.o=5,je(t),ze(t)}function je(t){t.A||(t.A=!0,X(t,"complete"),X(t,"error"))}function $e(t){if(t.h&&void 0!==s)if(t.v&&4==Ge(t))setTimeout(t.Ca.bind(t),0);else if(X(t,"readystatechange"),4==Ge(t)){t.h=!1;try{const s=t.ca();t:switch(s){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break t;default:e=!1}var n;if(!(n=e)){var r;if(r=0===s){let e=String(t.D).match(Xt)[1]||null;!e&&i.self&&i.self.location&&(e=i.self.location.protocol.slice(0,-1)),r=!Ue.test(e?e.toLowerCase():"")}n=r}if(n)X(t,"complete"),X(t,"success");else{t.o=6;try{var o=Ge(t)>2?t.g.statusText:""}catch(a){o=""}t.l=o+" ["+t.ca()+"]",je(t)}}finally{ze(t)}}}function ze(t,e){if(t.g){t.m&&(clearTimeout(t.m),t.m=null);const r=t.g;t.g=null,e||X(t,"ready");try{r.onreadystatechange=null}catch(n){}}}function Ge(t){return t.g?t.g.readyState:0}function Ke(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.F){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch(e){return null}}function He(t,e,n){return n&&n.internalChannelParams&&n.internalChannelParams[t]||e}function Qe(t){this.za=0,this.i=[],this.j=new _t,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=He("failFast",!1,t),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=He("baseRetryDelayMs",5e3,t),this.Za=He("retryDelaySeedMs",1e4,t),this.Ta=He("forwardChannelMaxRetries",2,t),this.va=He("forwardChannelRequestTimeoutMs",2e4,t),this.ma=t&&t.xmlHttpFactory||void 0,this.Ua=t&&t.Rb||void 0,this.Aa=t&&t.useFetchStreams||!1,this.O=void 0,this.L=t&&t.supportsCrossDomainXhr||!1,this.M="",this.h=new $t(t&&t.concurrentRequestLimit),this.Ba=new ke,this.S=t&&t.fastHandshake||!1,this.R=t&&t.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=t&&t.Pb||!1,t&&t.ua&&this.j.ua(),t&&t.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&t&&t.detectBufferingProxy||!1,this.ia=void 0,t&&t.longPollingTimeout&&t.longPollingTimeout>0&&(this.ia=t.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}function We(t){if(Ye(t),3==t.I){var e=t.V++,n=Jt(t.J);if(le(n,"SID",t.M),le(n,"RID",e),le(n,"TYPE","terminate"),tn(t,n),(e=new Dt(t,t.j,e)).M=2,e.A=de(Jt(n)),n=!1,i.navigator&&i.navigator.sendBeacon)try{n=i.navigator.sendBeacon(e.A.toString(),"")}catch(r){}!n&&i.Image&&((new Image).src=e.A,n=!0),n||(e.g=fn(e.j,null),e.g.ea(e.A)),e.F=Date.now(),Vt(e)}ln(t)}function Xe(t){t.g&&(sn(t),t.g.cancel(),t.g=null)}function Ye(t){Xe(t),t.v&&(i.clearTimeout(t.v),t.v=null),an(t),t.h.cancel(),t.m&&("number"==typeof t.m&&i.clearTimeout(t.m),t.m=null)}function Je(t){if(!zt(t.h)&&!t.m){t.m=!0;var e=t.Ea;v||E(),w||(v(),w=!0),_.add(e,t),t.D=0}}function Ze(t,e){var n;n=e?e.l:t.V++;const r=Jt(t.J);le(r,"SID",t.M),le(r,"RID",n),le(r,"AID",t.K),tn(t,r),t.u&&t.o&&Pe(r,t.u,t.o),n=new Dt(t,t.j,n,t.D+1),null===t.u&&(n.J=t.o),e&&(t.i=e.G.concat(t.i)),e=en(t,n,1e3),n.H=Math.round(.5*t.va)+Math.round(.5*t.va*Math.random()),Ht(t.h,n),xt(n,r,e)}function tn(t,e){t.H&&x(t.H,function(t,n){le(e,n,t)}),t.l&&x({},function(t,n){le(e,n,t)})}function en(t,e,n){n=Math.min(t.i.length,n);const r=t.l?c(t.l.Ka,t.l,t):null;t:{var s=t.i;let e=-1;for(;;){const t=["count="+n];-1==e?n>0?(e=s[0].g,t.push("ofs="+e)):e=0:t.push("ofs="+e);let c=!0;for(let h=0;h<n;h++){var i=s[h].g;const n=s[h].map;if((i-=e)<0)e=Math.max(0,s[h].g-100),c=!1;else try{i="req"+i+"_"||"";try{var a=n instanceof Map?n:Object.entries(n);for(const[e,n]of a){let r=n;o(n)&&(r=rt(n)),t.push(i+e+"="+encodeURIComponent(r))}}catch(u){throw t.push(i+"type="+encodeURIComponent("_badmap")),u}}catch(u){r&&r(n)}}if(c){a=t.join("&");break t}}a=void 0}return t=t.i.splice(0,n),e.G=t,a}function nn(t){if(!t.g&&!t.v){t.Y=1;var e=t.Da;v||E(),w||(v(),w=!0),_.add(e,t),t.A=0}}function rn(t){return!(t.g||t.v||t.A>=3)&&(t.Y++,t.v=wt(c(t.Da,t),un(t,t.A)),t.A++,!0)}function sn(t){null!=t.B&&(i.clearTimeout(t.B),t.B=null)}function on(t){t.g=new Dt(t,t.j,"rpc",t.Y),null===t.u&&(t.g.J=t.o),t.g.P=0;var e=Jt(t.na);le(e,"RID","rpc"),le(e,"SID",t.M),le(e,"AID",t.K),le(e,"CI",t.F?"0":"1"),!t.F&&t.ia&&le(e,"TO",t.ia),le(e,"TYPE","xmlhttp"),tn(t,e),t.u&&t.o&&Pe(e,t.u,t.o),t.O&&(t.g.H=t.O);var n=t.g;t=t.ba,n.M=1,n.A=de(Jt(e)),n.u=null,n.R=!0,Ot(n,t)}function an(t){null!=t.C&&(i.clearTimeout(t.C),t.C=null)}function cn(t,e){var n=null;if(t.g==e){an(t),sn(t),t.g=null;var r=2}else{if(!Kt(t.h,e))return;n=e.G,Qt(t.h,e),r=1}if(0!=t.I)if(e.o)if(1==r){n=e.u?e.u.length:0,e=Date.now()-e.F;var s=t.D;X(r=ft(),new vt(r,n)),Je(t)}else nn(t);else if(3==(s=e.m)||0==s&&e.X>0||!(1==r&&function(t,e){return!(Gt(t.h)>=t.h.j-(t.m?1:0)||(t.m?(t.i=e.G.concat(t.i),0):1==t.I||2==t.I||t.D>=(t.Sa?0:t.Ta)||(t.m=wt(c(t.Ea,t,e),un(t,t.D)),t.D++,0)))}(t,e)||2==r&&rn(t)))switch(n&&n.length>0&&(e=t.h,e.i=e.i.concat(n)),s){case 1:hn(t,5);break;case 4:hn(t,10);break;case 3:hn(t,6);break;default:hn(t,2)}}function un(t,e){let n=t.Qa+Math.floor(Math.random()*t.Za);return t.isActive()||(n*=2),n*e}function hn(t,e){if(t.j.info("Error code "+e),2==e){var n=c(t.bb,t),r=t.Ua;const e=!r;r=new Yt(r||"//www.google.com/images/cleardot.gif"),i.location&&"http"==i.location.protocol||ce(r,"https"),de(r),e?function(t,e){const n=new _t;if(i.Image){const r=new Image;r.onload=u(Ne,n,"TestLoadImage: loaded",!0,e,r),r.onerror=u(Ne,n,"TestLoadImage: error",!1,e,r),r.onabort=u(Ne,n,"TestLoadImage: abort",!1,e,r),r.ontimeout=u(Ne,n,"TestLoadImage: timeout",!1,e,r),i.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=t}else e(!1)}(r.toString(),n):function(t,e){new _t;const n=new AbortController,r=setTimeout(()=>{n.abort(),Ne(0,0,!1,e)},1e4);fetch(t,{signal:n.signal}).then(t=>{clearTimeout(r),t.ok?Ne(0,0,!0,e):Ne(0,0,!1,e)}).catch(()=>{clearTimeout(r),Ne(0,0,!1,e)})}(r.toString(),n)}else yt(2);t.I=0,t.l&&t.l.pa(e),ln(t),Ye(t)}function ln(t){if(t.I=0,t.ja=[],t.l){const e=Wt(t.h);0==e.length&&0==t.i.length||(f(t.ja,e),f(t.ja,t.i),t.h.i.length=0,d(t.i),t.i.length=0),t.l.oa()}}function dn(t,e,n){var r=n instanceof Yt?Jt(n):new Yt(n);if(""!=r.g)e&&(r.g=e+"."+r.g),ue(r,r.u);else{var s=i.location;r=s.protocol,e=e?e+"."+s.hostname:s.hostname,s=+s.port;const t=new Yt(null);r&&ce(t,r),e&&(t.g=e),s&&ue(t,s),n&&(t.h=n),r=t}return n=t.G,e=t.wa,n&&e&&le(r,n,e),le(r,"VER",t.ka),tn(t,r),r}function fn(t,e,n){if(e&&!t.L)throw Error("Can't create secondary domain capable XhrIo object.");return(e=t.Aa&&!t.ma?new Fe(new Re({ab:n})):new Fe(t.ma)).Fa(t.L),e}function pn(){}function gn(){}function mn(t,e){W.call(this),this.g=new Qe(e),this.l=t,this.h=e&&e.messageUrlParams||null,t=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(t?t["X-WebChannel-Content-Type"]=e.messageContentType:t={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.sa&&(t?t["X-WebChannel-Client-Profile"]=e.sa:t={"X-WebChannel-Client-Profile":e.sa}),this.g.U=t,(t=e&&e.Qb)&&!C(t)&&(this.g.u=t),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!C(e)&&(this.g.G=e,null!==(t=this.h)&&e in t&&(e in(t=this.h)&&delete t[e])),this.j=new wn(this)}function yn(t){ut.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var e=t.__sm__;if(e){t:{for(const n in e){t=n;break t}t=void 0}(this.i=t)&&(t=this.i,e=null!==e&&t in e?e[t]:void 0),this.data=e}else this.data=t}function vn(){ht.call(this),this.status=1}function wn(t){this.g=t}(t=Fe.prototype).Fa=function(t){this.H=t},t.ea=function(t,e,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);e=e?e.toUpperCase():"GET",this.D=t,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():bt.g(),this.g.onreadystatechange=l(c(this.Ca,this));try{this.B=!0,this.g.open(e,String(t),!0),this.B=!1}catch(o){return void qe(this,o)}if(t=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var s in r)n.set(s,r[s]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const t of r.keys())n.set(t,r.get(t))}r=Array.from(n.keys()).find(t=>"content-type"==t.toLowerCase()),s=i.FormData&&t instanceof i.FormData,!(Array.prototype.indexOf.call(Be,e,void 0)>=0)||r||s||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[i,a]of n)this.g.setRequestHeader(i,a);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(t),this.v=!1}catch(o){qe(this,o)}},t.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=t||7,X(this,"complete"),X(this,"abort"),ze(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ze(this,!0)),Fe.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?$e(this):this.Xa())},t.Xa=function(){$e(this)},t.isActive=function(){return!!this.g},t.ca=function(){try{return Ge(this)>2?this.g.status:-1}catch(t){return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch(t){return""}},t.La=function(t){if(this.g){var e=this.g.responseText;return t&&0==e.indexOf(t)&&(e=e.substring(t.length)),st(e)}},t.ya=function(){return this.o},t.Ha=function(){return"string"==typeof this.l?this.l:String(this.l)},(t=Qe.prototype).ka=8,t.I=1,t.connect=function(t,e,n,r){yt(0),this.W=t,this.H=e||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.J=dn(this,null,this.W),Je(this)},t.Ea=function(t){if(this.m)if(this.m=null,1==this.I){if(!t){this.V=Math.floor(1e5*Math.random()),t=this.V++;const s=new Dt(this,this.j,t);let i=this.o;if(this.U&&(i?(i=O(i),M(i,this.U)):i=this.U),null!==this.u||this.R||(s.J=i,i=null),this.S)t:{for(var e=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if((e+=r)>4096){e=n;break t}if(4096===e||n===this.i.length-1){e=n+1;break t}}e=1e3}else e=1e3;e=en(this,s,e),le(n=Jt(this.J),"RID",t),le(n,"CVER",22),this.G&&le(n,"X-HTTP-Session-Id",this.G),tn(this,n),i&&(this.R?e="headers="+Ct(Ve(i))+"&"+e:this.u&&Pe(n,this.u,i)),Ht(this.h,s),this.Ra&&le(n,"TYPE","init"),this.S?(le(n,"$req",e),le(n,"SID","null"),s.U=!0,xt(s,n,null)):xt(s,n,e),this.I=2}}else 3==this.I&&(t?Ze(this,t):0==this.i.length||zt(this.h)||Ze(this))},t.Da=function(){if(this.v=null,on(this),this.aa&&!(this.P||null==this.g||this.T<=0)){var t=4*this.T;this.j.info("BP detection timer enabled: "+t),this.B=wt(c(this.Wa,this),t)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,yt(10),Xe(this),on(this))},t.Va=function(){null!=this.C&&(this.C=null,Xe(this),rn(this),yt(19))},t.bb=function(t){t?(this.j.info("Successfully pinged google.com"),yt(2)):(this.j.info("Failed to ping google.com"),yt(1))},t.isActive=function(){return!!this.l&&this.l.isActive(this)},(t=pn.prototype).ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){},gn.prototype.g=function(t,e){return new mn(t,e)},h(mn,W),mn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},mn.prototype.close=function(){We(this.g)},mn.prototype.o=function(t){var e=this.g;if("string"==typeof t){var n={};n.__data__=t,t=n}else this.v&&((n={}).__data__=rt(t),t=n);e.i.push(new jt(e.Ya++,t)),3==e.I&&Je(e)},mn.prototype.N=function(){this.g.l=null,delete this.j,We(this.g),delete this.g,mn.Z.N.call(this)},h(yn,ut),h(vn,ht),h(wn,pn),wn.prototype.ra=function(){X(this.g,"a")},wn.prototype.qa=function(t){X(this.g,new yn(t))},wn.prototype.pa=function(t){X(this.g,new vn)},wn.prototype.oa=function(){X(this.g,"b")},gn.prototype.createWebChannel=gn.prototype.g,mn.prototype.send=mn.prototype.o,mn.prototype.open=mn.prototype.m,mn.prototype.close=mn.prototype.close,oe=function(){return new gn},ie=function(){return ft()},se=lt,re={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Tt.NO_ERROR=0,Tt.TIMEOUT=8,Tt.HTTP_ERROR=6,ne=Tt,It.COMPLETE="complete",ee=It,at.EventType=ct,ct.OPEN="a",ct.CLOSE="b",ct.ERROR="c",ct.MESSAGE="d",W.prototype.listen=W.prototype.J,te=at,Fe.prototype.listenOnce=Fe.prototype.K,Fe.prototype.getLastError=Fe.prototype.Ha,Fe.prototype.getLastErrorCode=Fe.prototype.ya,Fe.prototype.getStatus=Fe.prototype.ca,Fe.prototype.getResponseJson=Fe.prototype.La,Fe.prototype.getResponseText=Fe.prototype.la,Fe.prototype.send=Fe.prototype.ea,Fe.prototype.setWithCredentials=Fe.prototype.Fa,Zt=Fe}).apply(void 0!==ae?ae:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const ce="@firebase/firestore",ue="4.9.2";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(t){this.uid=t}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}he.UNAUTHENTICATED=new he(null),he.GOOGLE_CREDENTIALS=new he("google-credentials-uid"),he.FIRST_PARTY=new he("first-party-uid"),he.MOCK_USER=new he("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let le="12.3.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const de=new O("@firebase/firestore");function fe(){return de.logLevel}function pe(t,...e){if(de.logLevel<=A.DEBUG){const n=e.map(ye);de.debug(`Firestore (${le}): ${t}`,...n)}}function ge(t,...e){if(de.logLevel<=A.ERROR){const n=e.map(ye);de.error(`Firestore (${le}): ${t}`,...n)}}function me(t,...e){if(de.logLevel<=A.WARN){const n=e.map(ye);de.warn(`Firestore (${le}): ${t}`,...n)}}function ye(t){if("string"==typeof t)return t;try{
/**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
return e=t,JSON.stringify(e)}catch(n){return t}var e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(t,e,n){let r="Unexpected state";"string"==typeof e?r=e:n=e,we(t,r,n)}function we(t,e,n){let r=`FIRESTORE (${le}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(s){r+=" CONTEXT: "+n}throw ge(r),new Error(r)}function _e(t,e,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,t||we(e,s,r)}function Ee(t,e){return t}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const be={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Te extends y{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Ce{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(he.UNAUTHENTICATED))}shutdown(){}}class Ae{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class De{constructor(t){this.t=t,this.currentUser=he.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){_e(void 0===this.o,42304);let n=this.i;const r=t=>this.i!==n?(n=this.i,e(t)):Promise.resolve();let s=new Ie;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Ie,t.enqueueRetryable(()=>r(this.currentUser))};const i=()=>{const e=s;t.enqueueRetryable(async()=>{await e.promise,await r(this.currentUser)})},o=t=>{pe("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=t,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(t=>o(t)),setTimeout(()=>{if(!this.auth){const t=this.t.getImmediate({optional:!0});t?o(t):(pe("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ie)}},0),i()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(e=>this.i!==t?(pe("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):e?(_e("string"==typeof e.accessToken,31837,{l:e}),new Se(e.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return _e(null===t||"string"==typeof t,2055,{h:t}),new he(t)}}class Ne{constructor(t,e,n){this.P=t,this.T=e,this.I=n,this.type="FirstParty",this.user=he.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class ke{constructor(t,e,n){this.P=t,this.T=e,this.I=n}getToken(){return Promise.resolve(new Ne(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(he.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Re{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class xe{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Lt(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){_e(void 0===this.o,3512);const n=t=>{null!=t.error&&pe("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`);const n=t.token!==this.m;return this.m=t.token,pe("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?e(t.token):Promise.resolve()};this.o=e=>{t.enqueueRetryable(()=>n(e))};const r=t=>{pe("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=t,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(t=>r(t)),setTimeout(()=>{if(!this.appCheck){const t=this.V.getImmediate({optional:!0});t?r(t):pe("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Re(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(t=>t?(_e("string"==typeof t.token,44558,{tokenResult:t}),this.m=t.token,new Re(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(t){const e="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&"function"==typeof e.getRandomValues)e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le{static newId(){const t=62*Math.floor(256/62);let e="";for(;e.length<20;){const n=Oe(40);for(let r=0;r<n.length;++r)e.length<20&&n[r]<t&&(e+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return e}}function Me(t,e){return t<e?-1:t>e?1:0}function Ve(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const n=t.charAt(r),s=e.charAt(r);if(n!==s)return Ue(n)===Ue(s)?Me(n,s):Ue(n)?1:-1}return Me(t.length,e.length)}const Pe=55296,Fe=57343;function Ue(t){const e=t.charCodeAt(0);return e>=Pe&&e<=Fe}function Be(t,e,n){return t.length===e.length&&t.every((t,r)=>n(t,e[r]))}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qe="__name__";class je{constructor(t,e,n){void 0===e?e=0:e>t.length&&ve(637,{offset:e,range:t.length}),void 0===n?n=t.length-e:n>t.length-e&&ve(1746,{length:n,range:t.length-e}),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return 0===je.comparator(this,t)}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof je?t.forEach(t=>{e.push(t)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=void 0===t?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return 0===this.length}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const n=je.compareSegments(t.get(r),e.get(r));if(0!==n)return n}return Me(t.length,e.length)}static compareSegments(t,e){const n=je.isNumericId(t),r=je.isNumericId(e);return n&&!r?-1:!n&&r?1:n&&r?je.extractNumericId(t).compare(je.extractNumericId(e)):Ve(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return Xt.fromString(t.substring(4,t.length-2))}}class $e extends je{construct(t,e,n){return new $e(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new Te(be.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(t=>t.length>0))}return new $e(e)}static emptyPath(){return new $e([])}}const ze=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ge extends je{construct(t,e,n){return new Ge(t,e,n)}static isValidIdentifier(t){return ze.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ge.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===qe}static keyField(){return new Ge([qe])}static fromServerFormat(t){const e=[];let n="",r=0;const s=()=>{if(0===n.length)throw new Te(be.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let i=!1;for(;r<t.length;){const e=t[r];if("\\"===e){if(r+1===t.length)throw new Te(be.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const e=t[r+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new Te(be.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=e,r+=2}else"`"===e?(i=!i,r++):"."!==e||i?(n+=e,r++):(s(),r++)}if(s(),i)throw new Te(be.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new Ge(e)}static emptyPath(){return new Ge([])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(t){this.path=t}static fromPath(t){return new Ke($e.fromString(t))}static fromName(t){return new Ke($e.fromString(t).popFirst(5))}static empty(){return new Ke($e.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return null!==t&&0===$e.comparator(this.path,t.path)}toString(){return this.path.toString()}static comparator(t,e){return $e.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new Ke(new $e(t.slice()))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function He(t,e,n){if(!n)throw new Te(be.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Qe(t){if(!Ke.isDocumentKey(t))throw new Te(be.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function We(t){if(Ke.isDocumentKey(t))throw new Te(be.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function Xe(t){return"object"==typeof t&&null!==t&&(Object.getPrototypeOf(t)===Object.prototype||null===Object.getPrototypeOf(t))}function Ye(t){if(void 0===t)return"undefined";if(null===t)return"null";if("string"==typeof t)return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if("number"==typeof t||"boolean"==typeof t)return""+t;if("object"==typeof t){if(t instanceof Array)return"an array";{const n=(e=t).constructor?e.constructor.name:null;return n?`a custom ${n} object`:"an object"}}var e;return"function"==typeof t?"a function":ve(12329,{type:typeof t})}function Je(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new Te(be.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Ye(t);throw new Te(be.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ze(t,e){const n={typeString:t};return e&&(n.value=e),n}function tn(t,e){if(!Xe(t))throw new Te(be.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(s&&typeof o!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&o!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new Te(be.INVALID_ARGUMENT,n);return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const en=-62135596800,nn=1e6;class rn{static now(){return rn.fromMillis(Date.now())}static fromDate(t){return rn.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor((t-1e3*e)*nn);return new rn(e,n)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new Te(be.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new Te(be.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<en)throw new Te(be.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new Te(be.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/nn}_compareTo(t){return this.seconds===t.seconds?Me(this.nanoseconds,t.nanoseconds):Me(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:rn._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(tn(t,rn._jsonSchema))return new rn(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-en;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}rn._jsonSchemaVersion="firestore/timestamp/1.0",rn._jsonSchema={type:Ze("string",rn._jsonSchemaVersion),seconds:Ze("number"),nanoseconds:Ze("number")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sn{static fromTimestamp(t){return new sn(t)}static min(){return new sn(new rn(0,0))}static max(){return new sn(new rn(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(t){return new an(t.readTime,t.key,-1)}class an{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new an(sn.min(),Ke.empty(),-1)}static max(){return new an(sn.max(),Ke.empty(),-1)}}function cn(t,e){let n=t.readTime.compareTo(e.readTime);return 0!==n?n:(n=Ke.comparator(t.documentKey,e.documentKey),0!==n?n:Me(t.largestBatchId,e.largestBatchId)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)}class un{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hn(t){if(t.code!==be.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==t.message)throw t;pe("LocalStore","Unexpectedly lost primary lease")}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&ve(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new ln((n,r)=>{this.nextCallback=e=>{this.wrapSuccess(t,e).next(n,r)},this.catchCallback=t=>{this.wrapFailure(e,t).next(n,r)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof ln?e:ln.resolve(e)}catch(e){return ln.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):ln.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):ln.reject(e)}static resolve(t){return new ln((e,n)=>{e(t)})}static reject(t){return new ln((e,n)=>{n(t)})}static waitFor(t){return new ln((e,n)=>{let r=0,s=0,i=!1;t.forEach(t=>{++r,t.next(()=>{++s,i&&s===r&&e()},t=>n(t))}),i=!0,s===r&&e()})}static or(t){let e=ln.resolve(!1);for(const n of t)e=e.next(t=>t?ln.resolve(t):n());return e}static forEach(t,e){const n=[];return t.forEach((t,r)=>{n.push(e.call(this,t,r))}),this.waitFor(n)}static mapArray(t,e){return new ln((n,r)=>{const s=t.length,i=new Array(s);let o=0;for(let a=0;a<s;a++){const c=a;e(t[c]).next(t=>{i[c]=t,++o,o===s&&n(i)},t=>r(t))}})}static doWhile(t,e){return new ln((n,r)=>{const s=()=>{!0===t()?e().next(()=>{s()},r):n()};s()})}}function dn(t){return"IndexedDbTransactionError"===t.name}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=t=>this.ae(t),this.ue=t=>e.writeSequenceNumber(t))}ae(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ue&&this.ue(t),t}}fn.ce=-1;function pn(t){return null==t}function gn(t){return 0===t&&1/t==-1/0}function mn(t,e){let n=e;const r=t.length;for(let s=0;s<r;s++){const e=t.charAt(s);switch(e){case"\0":n+="";break;case"":n+="";break;default:n+=e}}return n}function yn(t){return t+""}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vn(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function wn(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function _n(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En{constructor(t,e){this.comparator=t,this.root=e||Tn.EMPTY}insert(t,e){return new En(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,Tn.BLACK,null,null))}remove(t){return new En(this.comparator,this.root.remove(t,this.comparator).copy(null,null,Tn.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(0===n)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(t,n.key);if(0===r)return e+n.left.size;r<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new bn(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new bn(this.root,t,this.comparator,!1)}getReverseIterator(){return new bn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new bn(this.root,t,this.comparator,!0)}}class bn{constructor(t,e,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!t.isEmpty();)if(s=e?n(t.key,e):1,e&&r&&(s*=-1),s<0)t=this.isReverse?t.left:t.right;else{if(0===s){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class Tn{constructor(t,e,n,r,s){this.key=t,this.value=e,this.color=null!=n?n:Tn.RED,this.left=null!=r?r:Tn.EMPTY,this.right=null!=s?s:Tn.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,r,s){return new Tn(null!=t?t:this.key,null!=e?e:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let r=this;const s=n(t,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(t,e,n),null):0===s?r.copy(null,e,null,null,null):r.copy(null,null,null,null,r.right.insert(t,e,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return Tn.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,r=this;if(e(t,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(t,e),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===e(t,r.key)){if(r.right.isEmpty())return Tn.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(t,e))}return r.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,Tn.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,Tn.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw ve(43730,{key:this.key,value:this.value});if(this.right.isRed())throw ve(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw ve(27949);return t+(this.isRed()?0:1)}}Tn.EMPTY=null,Tn.RED=!0,Tn.BLACK=!1,Tn.EMPTY=new class{constructor(){this.size=0}get key(){throw ve(57766)}get value(){throw ve(16141)}get color(){throw ve(16727)}get left(){throw ve(29726)}get right(){throw ve(36894)}copy(t,e,n,r,s){return this}insert(t,e,n){return new Tn(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class In{constructor(t){this.comparator=t,this.data=new En(this.comparator)}has(t){return null!==this.data.get(t)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,t[1])>=0)return;e(r.key)}}forEachWhile(t,e){let n;for(n=void 0!==e?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Sn(this.data.getIterator())}getIteratorFrom(t){return new Sn(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(t=>{e=e.add(t)}),e}isEqual(t){if(!(t instanceof In))return!1;if(this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(0!==this.comparator(t,r))return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new In(this.comparator);return e.data=t,e}}class Sn{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cn{constructor(t){this.fields=t,t.sort(Ge.comparator)}static empty(){return new Cn([])}unionWith(t){let e=new In(Ge.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Cn(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return Be(this.fields,t.fields,(t,e)=>t.isEqual(e))}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class An extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(t){try{return atob(t)}catch(e){throw"undefined"!=typeof DOMException&&e instanceof DOMException?new An("Invalid base64 string: "+e):e}}(t);return new Dn(e)}static fromUint8Array(t){const e=function(t){let e="";for(let n=0;n<t.length;++n)e+=String.fromCharCode(t[n]);return e}(t);return new Dn(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return t=this.binaryString,btoa(t);var t}toUint8Array(){return function(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return Me(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Dn.EMPTY_BYTE_STRING=new Dn("");const Nn=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function kn(t){if(_e(!!t,39018),"string"==typeof t){let e=0;const n=Nn.exec(t);if(_e(!!n,46558,{timestamp:t}),n[1]){let t=n[1];t=(t+"000000000").substr(0,9),e=Number(t)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Rn(t.seconds),nanos:Rn(t.nanos)}}function Rn(t){return"number"==typeof t?t:"string"==typeof t?Number(t):0}function xn(t){return"string"==typeof t?Dn.fromBase64String(t):Dn.fromUint8Array(t)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const On="server_timestamp",Ln="__type__",Mn="__previous_value__",Vn="__local_write_time__";function Pn(t){const e=(t?.mapValue?.fields||{})[Ln]?.stringValue;return e===On}function Fn(t){const e=t.mapValue.fields[Mn];return Pn(e)?Fn(e):e}function Un(t){const e=kn(t.mapValue.fields[Vn].timestampValue);return new rn(e.seconds,e.nanos)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(t,e,n,r,s,i,o,a,c,u){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=o,this.longPollingOptions=a,this.useFetchStreams=c,this.isUsingEmulator=u}}const qn="(default)";class jn{constructor(t,e){this.projectId=t,this.database=e||qn}static empty(){return new jn("","")}get isDefaultDatabase(){return this.database===qn}isEqual(t){return t instanceof jn&&t.projectId===this.projectId&&t.database===this.database}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $n="__type__",zn="__max__",Gn={},Kn="__vector__",Hn="value";function Qn(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Pn(t)?4:function(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===zn}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t)?9007199254740991:function(t){const e=(t?.mapValue?.fields||{})[$n]?.stringValue;return e===Kn}(t)?10:11:ve(28295,{value:t})}function Wn(t,e){if(t===e)return!0;const n=Qn(t);if(n!==Qn(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Un(t).isEqual(Un(e));case 3:return function(t,e){if("string"==typeof t.timestampValue&&"string"==typeof e.timestampValue&&t.timestampValue.length===e.timestampValue.length)return t.timestampValue===e.timestampValue;const n=kn(t.timestampValue),r=kn(e.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return r=e,xn(t.bytesValue).isEqual(xn(r.bytesValue));case 7:return t.referenceValue===e.referenceValue;case 8:return function(t,e){return Rn(t.geoPointValue.latitude)===Rn(e.geoPointValue.latitude)&&Rn(t.geoPointValue.longitude)===Rn(e.geoPointValue.longitude)}(t,e);case 2:return function(t,e){if("integerValue"in t&&"integerValue"in e)return Rn(t.integerValue)===Rn(e.integerValue);if("doubleValue"in t&&"doubleValue"in e){const n=Rn(t.doubleValue),r=Rn(e.doubleValue);return n===r?gn(n)===gn(r):isNaN(n)&&isNaN(r)}return!1}(t,e);case 9:return Be(t.arrayValue.values||[],e.arrayValue.values||[],Wn);case 10:case 11:return function(t,e){const n=t.mapValue.fields||{},r=e.mapValue.fields||{};if(vn(n)!==vn(r))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===r[s]||!Wn(n[s],r[s])))return!1;return!0}(t,e);default:return ve(52216,{left:t})}var r}function Xn(t,e){return void 0!==(t.values||[]).find(t=>Wn(t,e))}function Yn(t,e){if(t===e)return 0;const n=Qn(t),r=Qn(e);if(n!==r)return Me(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Me(t.booleanValue,e.booleanValue);case 2:return function(t,e){const n=Rn(t.integerValue||t.doubleValue),r=Rn(e.integerValue||e.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(t,e);case 3:return Jn(t.timestampValue,e.timestampValue);case 4:return Jn(Un(t),Un(e));case 5:return Ve(t.stringValue,e.stringValue);case 6:return function(t,e){const n=xn(t),r=xn(e);return n.compareTo(r)}(t.bytesValue,e.bytesValue);case 7:return function(t,e){const n=t.split("/"),r=e.split("/");for(let s=0;s<n.length&&s<r.length;s++){const t=Me(n[s],r[s]);if(0!==t)return t}return Me(n.length,r.length)}(t.referenceValue,e.referenceValue);case 8:return function(t,e){const n=Me(Rn(t.latitude),Rn(e.latitude));return 0!==n?n:Me(Rn(t.longitude),Rn(e.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Zn(t.arrayValue,e.arrayValue);case 10:return function(t,e){const n=t.fields||{},r=e.fields||{},s=n[Hn]?.arrayValue,i=r[Hn]?.arrayValue,o=Me(s?.values?.length||0,i?.values?.length||0);return 0!==o?o:Zn(s,i)}(t.mapValue,e.mapValue);case 11:return function(t,e){if(t===Gn&&e===Gn)return 0;if(t===Gn)return 1;if(e===Gn)return-1;const n=t.fields||{},r=Object.keys(n),s=e.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let o=0;o<r.length&&o<i.length;++o){const t=Ve(r[o],i[o]);if(0!==t)return t;const e=Yn(n[r[o]],s[i[o]]);if(0!==e)return e}return Me(r.length,i.length)}(t.mapValue,e.mapValue);default:throw ve(23264,{he:n})}}function Jn(t,e){if("string"==typeof t&&"string"==typeof e&&t.length===e.length)return Me(t,e);const n=kn(t),r=kn(e),s=Me(n.seconds,r.seconds);return 0!==s?s:Me(n.nanos,r.nanos)}function Zn(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const t=Yn(n[s],r[s]);if(t)return t}return Me(n.length,r.length)}function tr(t){return er(t)}function er(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(t){const e=kn(t);return`time(${e.seconds},${e.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?xn(t.bytesValue).toBase64():"referenceValue"in t?function(t){return Ke.fromName(t).toString()}(t.referenceValue):"geoPointValue"in t?function(t){return`geo(${t.latitude},${t.longitude})`}(t.geoPointValue):"arrayValue"in t?function(t){let e="[",n=!0;for(const r of t.values||[])n?n=!1:e+=",",e+=er(r);return e+"]"}(t.arrayValue):"mapValue"in t?function(t){const e=Object.keys(t.fields||{}).sort();let n="{",r=!0;for(const s of e)r?r=!1:n+=",",n+=`${s}:${er(t.fields[s])}`;return n+"}"}(t.mapValue):ve(61005,{value:t})}function nr(t){switch(Qn(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Fn(t);return e?16+nr(e):16;case 5:return 2*t.stringValue.length;case 6:return xn(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return(t.arrayValue.values||[]).reduce((t,e)=>t+nr(e),0);case 10:case 11:return function(t){let e=0;return wn(t.fields,(t,n)=>{e+=t.length+nr(n)}),e}(t.mapValue);default:throw ve(13486,{value:t})}}function rr(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function sr(t){return!!t&&"integerValue"in t}function ir(t){return!!t&&"arrayValue"in t}function or(t){return!!t&&"nullValue"in t}function ar(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function cr(t){return!!t&&"mapValue"in t}function ur(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&"object"==typeof t.timestampValue)return{timestampValue:{...t.timestampValue}};if(t.mapValue){const e={mapValue:{fields:{}}};return wn(t.mapValue.fields,(t,n)=>e.mapValue.fields[t]=ur(n)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=ur(t.arrayValue.values[n]);return e}return{...t}}class hr{constructor(t){this.value=t}static empty(){return new hr({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!cr(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=ur(e)}setAll(t){let e=Ge.emptyPath(),n={},r=[];t.forEach((t,s)=>{if(!e.isImmediateParentOf(s)){const t=this.getFieldsMap(e);this.applyChanges(t,n,r),n={},r=[],e=s.popLast()}t?n[s.lastSegment()]=ur(t):r.push(s.lastSegment())});const s=this.getFieldsMap(e);this.applyChanges(s,n,r)}delete(t){const e=this.field(t.popLast());cr(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Wn(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let r=e.mapValue.fields[t.get(n)];cr(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=r),e=r}return e.mapValue.fields}applyChanges(t,e,n){wn(e,(e,n)=>t[e]=n);for(const r of n)delete t[r]}clone(){return new hr(ur(this.value))}}function lr(t){const e=[];return wn(t.fields,(t,n)=>{const r=new Ge([t]);if(cr(n)){const t=lr(n.mapValue).fields;if(0===t.length)e.push(r);else for(const n of t)e.push(r.child(n))}else e.push(r)}),new Cn(e)
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class dr{constructor(t,e,n,r,s,i,o){this.key=t,this.documentType=e,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=o}static newInvalidDocument(t){return new dr(t,0,sn.min(),sn.min(),sn.min(),hr.empty(),0)}static newFoundDocument(t,e,n,r){return new dr(t,1,e,sn.min(),n,r,0)}static newNoDocument(t,e){return new dr(t,2,e,sn.min(),sn.min(),hr.empty(),0)}static newUnknownDocument(t,e){return new dr(t,3,e,sn.min(),sn.min(),hr.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(sn.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=hr.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=hr.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=sn.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(t){return t instanceof dr&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new dr(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(t,e){this.position=t,this.inclusive=e}}function pr(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],o=t.position[s];if(r=i.field.isKeyField()?Ke.comparator(Ke.fromName(o.referenceValue),n.key):Yn(o,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function gr(t,e){if(null===t)return null===e;if(null===e)return!1;if(t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Wn(t.position[n],e.position[n]))return!1;return!0}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr{constructor(t,e="asc"){this.field=t,this.dir=e}}function yr(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vr{}class wr extends vr{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?"in"===e||"not-in"===e?this.createKeyFieldInFilter(t,e,n):new Cr(t,e,n):"array-contains"===e?new kr(t,n):"in"===e?new Rr(t,n):"not-in"===e?new xr(t,n):"array-contains-any"===e?new Or(t,n):new wr(t,e,n)}static createKeyFieldInFilter(t,e,n){return"in"===e?new Ar(t,n):new Dr(t,n)}matches(t){const e=t.data.field(this.field);return"!="===this.op?null!==e&&void 0===e.nullValue&&this.matchesComparison(Yn(e,this.value)):null!==e&&Qn(this.value)===Qn(e)&&this.matchesComparison(Yn(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return 0===t;case"!=":return 0!==t;case">":return t>0;case">=":return t>=0;default:return ve(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class _r extends vr{constructor(t,e){super(),this.filters=t,this.op=e,this.Pe=null}static create(t,e){return new _r(t,e)}matches(t){return Er(this)?void 0===this.filters.find(e=>!e.matches(t)):void 0!==this.filters.find(e=>e.matches(t))}getFlattenedFilters(){return null!==this.Pe||(this.Pe=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Er(t){return"and"===t.op}function br(t){return function(t){for(const e of t.filters)if(e instanceof _r)return!1;return!0}(t)&&Er(t)}function Tr(t){if(t instanceof wr)return t.field.canonicalString()+t.op.toString()+tr(t.value);if(br(t))return t.filters.map(t=>Tr(t)).join(",");{const e=t.filters.map(t=>Tr(t)).join(",");return`${t.op}(${e})`}}function Ir(t,e){return t instanceof wr?(n=t,(r=e)instanceof wr&&n.op===r.op&&n.field.isEqual(r.field)&&Wn(n.value,r.value)):t instanceof _r?function(t,e){return e instanceof _r&&t.op===e.op&&t.filters.length===e.filters.length&&t.filters.reduce((t,n,r)=>t&&Ir(n,e.filters[r]),!0)}(t,e):void ve(19439);var n,r}function Sr(t){return t instanceof wr?`${(e=t).field.canonicalString()} ${e.op} ${tr(e.value)}`:t instanceof _r?function(t){return t.op.toString()+" {"+t.getFilters().map(Sr).join(" ,")+"}"}(t):"Filter";var e}class Cr extends wr{constructor(t,e,n){super(t,e,n),this.key=Ke.fromName(n.referenceValue)}matches(t){const e=Ke.comparator(t.key,this.key);return this.matchesComparison(e)}}class Ar extends wr{constructor(t,e){super(t,"in",e),this.keys=Nr("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Dr extends wr{constructor(t,e){super(t,"not-in",e),this.keys=Nr("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Nr(t,e){return(e.arrayValue?.values||[]).map(t=>Ke.fromName(t.referenceValue))}class kr extends wr{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return ir(e)&&Xn(e.arrayValue,this.value)}}class Rr extends wr{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return null!==e&&Xn(this.value.arrayValue,e)}}class xr extends wr{constructor(t,e){super(t,"not-in",e)}matches(t){if(Xn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return null!==e&&void 0===e.nullValue&&!Xn(this.value.arrayValue,e)}}class Or extends wr{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!ir(e)||!e.arrayValue.values)&&e.arrayValue.values.some(t=>Xn(this.value.arrayValue,t))}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lr{constructor(t,e=null,n=[],r=[],s=null,i=null,o=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=o,this.Te=null}}function Mr(t,e=null,n=[],r=[],s=null,i=null,o=null){return new Lr(t,e,n,r,s,i,o)}function Vr(t){const e=Ee(t);if(null===e.Te){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(t=>Tr(t)).join(","),t+="|ob:",t+=e.orderBy.map(t=>{return(e=t).field.canonicalString()+e.dir;var e}).join(","),pn(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(t=>tr(t)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(t=>tr(t)).join(",")),e.Te=t}return e.Te}function Pr(t,e){if(t.limit!==e.limit)return!1;if(t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!yr(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!Ir(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!gr(t.startAt,e.startAt)&&gr(t.endAt,e.endAt)}function Fr(t){return Ke.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(t,e=null,n=[],r=[],s=null,i="F",o=null,a=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=o,this.endAt=a,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function Br(t){return new Ur(t)}function qr(t){return 0===t.filters.length&&null===t.limit&&null==t.startAt&&null==t.endAt&&(0===t.explicitOrderBy.length||1===t.explicitOrderBy.length&&t.explicitOrderBy[0].field.isKeyField())}function jr(t){return null!==t.collectionGroup}function $r(t){const e=Ee(t);if(null===e.Ie){e.Ie=[];const t=new Set;for(const r of e.explicitOrderBy)e.Ie.push(r),t.add(r.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(t){let e=new In(Ge.comparator);return t.filters.forEach(t=>{t.getFlattenedFilters().forEach(t=>{t.isInequality()&&(e=e.add(t.field))})}),e})(e).forEach(r=>{t.has(r.canonicalString())||r.isKeyField()||e.Ie.push(new mr(r,n))}),t.has(Ge.keyField().canonicalString())||e.Ie.push(new mr(Ge.keyField(),n))}return e.Ie}function zr(t){const e=Ee(t);return e.Ee||(e.Ee=function(t,e){if("F"===t.limitType)return Mr(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(t=>{const e="desc"===t.dir?"asc":"desc";return new mr(t.field,e)});const n=t.endAt?new fr(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new fr(t.startAt.position,t.startAt.inclusive):null;return Mr(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}(e,$r(t))),e.Ee}function Gr(t,e){const n=t.filters.concat([e]);return new Ur(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Kr(t,e,n){return new Ur(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Hr(t,e){return Pr(zr(t),zr(e))&&t.limitType===e.limitType}function Qr(t){return`${Vr(zr(t))}|lt:${t.limitType}`}function Wr(t){return`Query(target=${function(t){let e=t.path.canonicalString();return null!==t.collectionGroup&&(e+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(e+=`, filters: [${t.filters.map(t=>Sr(t)).join(", ")}]`),pn(t.limit)||(e+=", limit: "+t.limit),t.orderBy.length>0&&(e+=`, orderBy: [${t.orderBy.map(t=>{return`${(e=t).field.canonicalString()} (${e.dir})`;var e}).join(", ")}]`),t.startAt&&(e+=", startAt: ",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(t=>tr(t)).join(",")),t.endAt&&(e+=", endAt: ",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(t=>tr(t)).join(",")),`Target(${e})`}(zr(t))}; limitType=${t.limitType})`}function Xr(t,e){return e.isFoundDocument()&&function(t,e){const n=e.key.path;return null!==t.collectionGroup?e.key.hasCollectionId(t.collectionGroup)&&t.path.isPrefixOf(n):Ke.isDocumentKey(t.path)?t.path.isEqual(n):t.path.isImmediateParentOf(n)}(t,e)&&function(t,e){for(const n of $r(t))if(!n.field.isKeyField()&&null===e.data.field(n.field))return!1;return!0}(t,e)&&function(t,e){for(const n of t.filters)if(!n.matches(e))return!1;return!0}(t,e)&&(r=e,!((n=t).startAt&&!function(t,e,n){const r=pr(t,e,n);return t.inclusive?r<=0:r<0}(n.startAt,$r(n),r)||n.endAt&&!function(t,e,n){const r=pr(t,e,n);return t.inclusive?r>=0:r>0}(n.endAt,$r(n),r)));var n,r}function Yr(t){return(e,n)=>{let r=!1;for(const s of $r(t)){const t=Jr(s,e,n);if(0!==t)return t;r=r||s.field.isKeyField()}return 0}}function Jr(t,e,n){const r=t.field.isKeyField()?Ke.comparator(e.key,n.key):function(t,e,n){const r=e.data.field(t),s=n.data.field(t);return null!==r&&null!==s?Yn(r,s):ve(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return ve(19790,{direction:t.dir})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,t))return s}has(t){return void 0!==this.get(t)}set(t,e){const n=this.mapKeyFn(t),r=this.inner[n];if(void 0===r)return this.inner[n]=[[t,e]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],t))return void(r[s]=[t,e]);r.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],t))return 1===n.length?delete this.inner[e]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(t){wn(this.inner,(e,n)=>{for(const[r,s]of n)t(r,s)})}isEmpty(){return _n(this.inner)}size(){return this.innerSize}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts=new En(Ke.comparator);function es(){return ts}const ns=new En(Ke.comparator);function rs(...t){let e=ns;for(const n of t)e=e.insert(n.key,n);return e}function ss(t){let e=ns;return t.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function is(){return as()}function os(){return as()}function as(){return new Zr(t=>t.toString(),(t,e)=>t.isEqual(e))}const cs=new En(Ke.comparator),us=new In(Ke.comparator);function hs(...t){let e=us;for(const n of t)e=e.add(n);return e}const ls=new In(Me);
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ds(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:gn(e)?"-0":e}}function fs(t){return{integerValue:""+t}}function ps(t,e){return function(t){return"number"==typeof t&&Number.isInteger(t)&&!gn(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)?fs(e):ds(t,e)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(){this._=void 0}}function ms(t,e,n){return t instanceof ws?function(t,e){const n={fields:{[Ln]:{stringValue:On},[Vn]:{timestampValue:{seconds:t.seconds,nanos:t.nanoseconds}}}};return e&&Pn(e)&&(e=Fn(e)),e&&(n.fields[Mn]=e),{mapValue:n}}(n,e):t instanceof _s?Es(t,e):t instanceof bs?Ts(t,e):function(t,e){const n=vs(t,e),r=Ss(n)+Ss(t.Ae);return sr(n)&&sr(t.Ae)?fs(r):ds(t.serializer,r)}(t,e)}function ys(t,e,n){return t instanceof _s?Es(t,e):t instanceof bs?Ts(t,e):n}function vs(t,e){return t instanceof Is?sr(n=e)||(r=n)&&"doubleValue"in r?e:{integerValue:0}:null;var n,r}class ws extends gs{}class _s extends gs{constructor(t){super(),this.elements=t}}function Es(t,e){const n=Cs(e);for(const r of t.elements)n.some(t=>Wn(t,r))||n.push(r);return{arrayValue:{values:n}}}class bs extends gs{constructor(t){super(),this.elements=t}}function Ts(t,e){let n=Cs(e);for(const r of t.elements)n=n.filter(t=>!Wn(t,r));return{arrayValue:{values:n}}}class Is extends gs{constructor(t,e){super(),this.serializer=t,this.Ae=e}}function Ss(t){return Rn(t.integerValue||t.doubleValue)}function Cs(t){return ir(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}class As{constructor(t,e){this.version=t,this.transformResults=e}}class Ds{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Ds}static exists(t){return new Ds(void 0,t)}static updateTime(t){return new Ds(t)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Ns(t,e){return void 0!==t.updateTime?e.isFoundDocument()&&e.version.isEqual(t.updateTime):void 0===t.exists||t.exists===e.isFoundDocument()}class ks{}function Rs(t,e){if(!t.hasLocalMutations||e&&0===e.fields.length)return null;if(null===e)return t.isNoDocument()?new qs(t.key,Ds.none()):new Vs(t.key,t.data,Ds.none());{const n=t.data,r=hr.empty();let s=new In(Ge.comparator);for(let t of e.fields)if(!s.has(t)){let e=n.field(t);null===e&&t.length>1&&(t=t.popLast(),e=n.field(t)),null===e?r.delete(t):r.set(t,e),s=s.add(t)}return new Ps(t.key,r,new Cn(s.toArray()),Ds.none())}}function xs(t,e,n){var r;t instanceof Vs?function(t,e,n){const r=t.value.clone(),s=Us(t.fieldTransforms,e,n.transformResults);r.setAll(s),e.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(t,e,n):t instanceof Ps?function(t,e,n){if(!Ns(t.precondition,e))return void e.convertToUnknownDocument(n.version);const r=Us(t.fieldTransforms,e,n.transformResults),s=e.data;s.setAll(Fs(t)),s.setAll(r),e.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(t,e,n):(r=n,e.convertToNoDocument(r.version).setHasCommittedMutations())}function Os(t,e,n,r){return t instanceof Vs?function(t,e,n,r){if(!Ns(t.precondition,e))return n;const s=t.value.clone(),i=Bs(t.fieldTransforms,r,e);return s.setAll(i),e.convertToFoundDocument(e.version,s).setHasLocalMutations(),null}(t,e,n,r):t instanceof Ps?function(t,e,n,r){if(!Ns(t.precondition,e))return n;const s=Bs(t.fieldTransforms,r,e),i=e.data;return i.setAll(Fs(t)),i.setAll(s),e.convertToFoundDocument(e.version,i).setHasLocalMutations(),null===n?null:n.unionWith(t.fieldMask.fields).unionWith(t.fieldTransforms.map(t=>t.field))}(t,e,n,r):(s=e,i=n,Ns(t.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):i);var s,i}function Ls(t,e){let n=null;for(const r of t.fieldTransforms){const t=e.data.field(r.field),s=vs(r.transform,t||null);null!=s&&(null===n&&(n=hr.empty()),n.set(r.field,s))}return n||null}function Ms(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&(n=t.fieldTransforms,r=e.fieldTransforms,!!(void 0===n&&void 0===r||n&&r&&Be(n,r,(t,e)=>function(t,e){return t.field.isEqual(e.field)&&(n=t.transform,r=e.transform,n instanceof _s&&r instanceof _s||n instanceof bs&&r instanceof bs?Be(n.elements,r.elements,Wn):n instanceof Is&&r instanceof Is?Wn(n.Ae,r.Ae):n instanceof ws&&r instanceof ws);var n,r}(t,e)))&&(0===t.type?t.value.isEqual(e.value):1!==t.type||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask)));var n,r}class Vs extends ks{constructor(t,e,n,r=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class Ps extends ks{constructor(t,e,n,r,s=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Fs(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Us(t,e,n){const r=new Map;_e(t.length===n.length,32656,{Re:n.length,Ve:t.length});for(let s=0;s<n.length;s++){const i=t[s],o=i.transform,a=e.data.field(i.field);r.set(i.field,ys(o,a,n[s]))}return r}function Bs(t,e,n){const r=new Map;for(const s of t){const t=s.transform,i=n.data.field(s.field);r.set(s.field,ms(t,i,e))}return r}class qs extends ks{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class js extends ks{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s{constructor(t,e,n,r){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let r=0;r<this.mutations.length;r++){const e=this.mutations[r];e.key.isEqual(t.key)&&xs(e,t,n[r])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=Os(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=Os(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=os();return this.mutations.forEach(r=>{const s=t.get(r.key),i=s.overlayedDocument;let o=this.applyToLocalView(i,s.mutatedFields);o=e.has(r.key)?null:o;const a=Rs(i,o);null!==a&&n.set(r.key,a),i.isValidDocument()||i.convertToNoDocument(sn.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),hs())}isEqual(t){return this.batchId===t.batchId&&Be(this.mutations,t.mutations,(t,e)=>Ms(t,e))&&Be(this.baseMutations,t.baseMutations,(t,e)=>Ms(t,e))}}class zs{constructor(t,e,n,r){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=r}static from(t,e,n){_e(t.mutations.length===n.length,58842,{me:t.mutations.length,fe:n.length});let r=function(){return cs}();const s=t.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new zs(t,e,n,r)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return null!==t&&this.mutation===t.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(t,e){this.count=t,this.unchangedNames=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Hs,Qs;function Ws(t){if(void 0===t)return ge("GRPC error has no .code"),be.UNKNOWN;switch(t){case Hs.OK:return be.OK;case Hs.CANCELLED:return be.CANCELLED;case Hs.UNKNOWN:return be.UNKNOWN;case Hs.DEADLINE_EXCEEDED:return be.DEADLINE_EXCEEDED;case Hs.RESOURCE_EXHAUSTED:return be.RESOURCE_EXHAUSTED;case Hs.INTERNAL:return be.INTERNAL;case Hs.UNAVAILABLE:return be.UNAVAILABLE;case Hs.UNAUTHENTICATED:return be.UNAUTHENTICATED;case Hs.INVALID_ARGUMENT:return be.INVALID_ARGUMENT;case Hs.NOT_FOUND:return be.NOT_FOUND;case Hs.ALREADY_EXISTS:return be.ALREADY_EXISTS;case Hs.PERMISSION_DENIED:return be.PERMISSION_DENIED;case Hs.FAILED_PRECONDITION:return be.FAILED_PRECONDITION;case Hs.ABORTED:return be.ABORTED;case Hs.OUT_OF_RANGE:return be.OUT_OF_RANGE;case Hs.UNIMPLEMENTED:return be.UNIMPLEMENTED;case Hs.DATA_LOSS:return be.DATA_LOSS;default:return ve(39323,{code:t})}}(Qs=Hs||(Hs={}))[Qs.OK=0]="OK",Qs[Qs.CANCELLED=1]="CANCELLED",Qs[Qs.UNKNOWN=2]="UNKNOWN",Qs[Qs.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Qs[Qs.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Qs[Qs.NOT_FOUND=5]="NOT_FOUND",Qs[Qs.ALREADY_EXISTS=6]="ALREADY_EXISTS",Qs[Qs.PERMISSION_DENIED=7]="PERMISSION_DENIED",Qs[Qs.UNAUTHENTICATED=16]="UNAUTHENTICATED",Qs[Qs.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Qs[Qs.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Qs[Qs.ABORTED=10]="ABORTED",Qs[Qs.OUT_OF_RANGE=11]="OUT_OF_RANGE",Qs[Qs.UNIMPLEMENTED=12]="UNIMPLEMENTED",Qs[Qs.INTERNAL=13]="INTERNAL",Qs[Qs.UNAVAILABLE=14]="UNAVAILABLE",Qs[Qs.DATA_LOSS=15]="DATA_LOSS";
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Xs=new Xt([4294967295,4294967295],0);function Ys(t){const e=(new TextEncoder).encode(t),n=new Yt;return n.update(e),new Uint8Array(n.digest())}function Js(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Xt([n,r],0),new Xt([s,i],0)]}class Zs{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new ti(`Invalid padding: ${e}`);if(n<0)throw new ti(`Invalid hash count: ${n}`);if(t.length>0&&0===this.hashCount)throw new ti(`Invalid hash count: ${n}`);if(0===t.length&&0!==e)throw new ti(`Invalid padding when bitmap length is 0: ${e}`);this.ge=8*t.length-e,this.pe=Xt.fromNumber(this.ge)}ye(t,e,n){let r=t.add(e.multiply(Xt.fromNumber(n)));return 1===r.compare(Xs)&&(r=new Xt([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(0===this.ge)return!1;const e=Ys(t),[n,r]=Js(e);for(let s=0;s<this.hashCount;s++){const t=this.ye(n,r,s);if(!this.we(t))return!1}return!0}static create(t,e,n){const r=t%8==0?0:8-t%8,s=new Uint8Array(Math.ceil(t/8)),i=new Zs(s,r,e);return n.forEach(t=>i.insert(t)),i}insert(t){if(0===this.ge)return;const e=Ys(t),[n,r]=Js(e);for(let s=0;s<this.hashCount;s++){const t=this.ye(n,r,s);this.Se(t)}}Se(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class ti extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ei{constructor(t,e,n,r,s){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const r=new Map;return r.set(t,ni.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new ei(sn.min(),r,new En(Me),es(),hs())}}class ni{constructor(t,e,n,r,s){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new ni(n,e,hs(),hs(),hs())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ri{constructor(t,e,n,r){this.be=t,this.removedTargetIds=e,this.key=n,this.De=r}}class si{constructor(t,e){this.targetId=t,this.Ce=e}}class ii{constructor(t,e,n=Dn.EMPTY_BYTE_STRING,r=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=r}}class oi{constructor(){this.ve=0,this.Fe=ui(),this.Me=Dn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return 0!==this.ve}get Be(){return this.Oe}Le(t){t.approximateByteSize()>0&&(this.Oe=!0,this.Me=t)}ke(){let t=hs(),e=hs(),n=hs();return this.Fe.forEach((r,s)=>{switch(s){case 0:t=t.add(r);break;case 2:e=e.add(r);break;case 1:n=n.add(r);break;default:ve(38017,{changeType:s})}}),new ni(this.Me,this.xe,t,e,n)}qe(){this.Oe=!1,this.Fe=ui()}Qe(t,e){this.Oe=!0,this.Fe=this.Fe.insert(t,e)}$e(t){this.Oe=!0,this.Fe=this.Fe.remove(t)}Ue(){this.ve+=1}Ke(){this.ve-=1,_e(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class ai{constructor(t){this.Ge=t,this.ze=new Map,this.je=es(),this.Je=ci(),this.He=ci(),this.Ye=new En(Me)}Ze(t){for(const e of t.be)t.De&&t.De.isFoundDocument()?this.Xe(e,t.De):this.et(e,t.key,t.De);for(const e of t.removedTargetIds)this.et(e,t.key,t.De)}tt(t){this.forEachTarget(t,e=>{const n=this.nt(e);switch(t.state){case 0:this.rt(e)&&n.Le(t.resumeToken);break;case 1:n.Ke(),n.Ne||n.qe(),n.Le(t.resumeToken);break;case 2:n.Ke(),n.Ne||this.removeTarget(e);break;case 3:this.rt(e)&&(n.We(),n.Le(t.resumeToken));break;case 4:this.rt(e)&&(this.it(e),n.Le(t.resumeToken));break;default:ve(56790,{state:t.state})}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.ze.forEach((t,n)=>{this.rt(n)&&e(n)})}st(t){const e=t.targetId,n=t.Ce.count,r=this.ot(e);if(r){const s=r.target;if(Fr(s))if(0===n){const t=new Ke(s.path);this.et(e,t,dr.newNoDocument(t,sn.min()))}else _e(1===n,20013,{expectedCount:n});else{const r=this._t(e);if(r!==n){const n=this.ut(t),s=n?this.ct(n,t,r):1;if(0!==s){this.it(e);const t=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(e,t)}}}}}ut(t){const e=t.Ce.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=e;let i,o;try{i=xn(n).toUint8Array()}catch(a){if(a instanceof An)return me("Decoding the base64 bloom filter in existence filter failed ("+a.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw a}try{o=new Zs(i,r,s)}catch(a){return me(a instanceof ti?"BloomFilter error: ":"Applying bloom filter failed: ",a),null}return 0===o.ge?null:o}ct(t,e,n){return e.Ce.count===n-this.Pt(t,e.targetId)?0:2}Pt(t,e){const n=this.Ge.getRemoteKeysForTarget(e);let r=0;return n.forEach(n=>{const s=this.Ge.ht(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;t.mightContain(i)||(this.et(e,n,null),r++)}),r}Tt(t){const e=new Map;this.ze.forEach((n,r)=>{const s=this.ot(r);if(s){if(n.current&&Fr(s.target)){const e=new Ke(s.target.path);this.It(e).has(r)||this.Et(r,e)||this.et(r,e,dr.newNoDocument(e,t))}n.Be&&(e.set(r,n.ke()),n.qe())}});let n=hs();this.He.forEach((t,e)=>{let r=!0;e.forEachWhile(t=>{const e=this.ot(t);return!e||"TargetPurposeLimboResolution"===e.purpose||(r=!1,!1)}),r&&(n=n.add(t))}),this.je.forEach((e,n)=>n.setReadTime(t));const r=new ei(t,e,this.Ye,this.je,n);return this.je=es(),this.Je=ci(),this.He=ci(),this.Ye=new En(Me),r}Xe(t,e){if(!this.rt(t))return;const n=this.Et(t,e.key)?2:0;this.nt(t).Qe(e.key,n),this.je=this.je.insert(e.key,e),this.Je=this.Je.insert(e.key,this.It(e.key).add(t)),this.He=this.He.insert(e.key,this.dt(e.key).add(t))}et(t,e,n){if(!this.rt(t))return;const r=this.nt(t);this.Et(t,e)?r.Qe(e,1):r.$e(e),this.He=this.He.insert(e,this.dt(e).delete(t)),this.He=this.He.insert(e,this.dt(e).add(t)),n&&(this.je=this.je.insert(e,n))}removeTarget(t){this.ze.delete(t)}_t(t){const e=this.nt(t).ke();return this.Ge.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}Ue(t){this.nt(t).Ue()}nt(t){let e=this.ze.get(t);return e||(e=new oi,this.ze.set(t,e)),e}dt(t){let e=this.He.get(t);return e||(e=new In(Me),this.He=this.He.insert(t,e)),e}It(t){let e=this.Je.get(t);return e||(e=new In(Me),this.Je=this.Je.insert(t,e)),e}rt(t){const e=null!==this.ot(t);return e||pe("WatchChangeAggregator","Detected inactive target",t),e}ot(t){const e=this.ze.get(t);return e&&e.Ne?null:this.Ge.At(t)}it(t){this.ze.set(t,new oi),this.Ge.getRemoteKeysForTarget(t).forEach(e=>{this.et(t,e,null)})}Et(t,e){return this.Ge.getRemoteKeysForTarget(t).has(e)}}function ci(){return new En(Ke.comparator)}function ui(){return new En(Ke.comparator)}const hi=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),li=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),di=(()=>({and:"AND",or:"OR"}))();class fi{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function pi(t,e){return t.useProto3Json||pn(e)?e:{value:e}}function gi(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function mi(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function yi(t,e){return gi(t,e.toTimestamp())}function vi(t){return _e(!!t,49232),sn.fromTimestamp(function(t){const e=kn(t);return new rn(e.seconds,e.nanos)}(t))}function wi(t,e){return _i(t,e).canonicalString()}function _i(t,e){const n=(r=t,new $e(["projects",r.projectId,"databases",r.database])).child("documents");var r;return void 0===e?n:n.child(e)}function Ei(t){const e=$e.fromString(t);return _e(Ui(e),10190,{key:e.toString()}),e}function bi(t,e){return wi(t.databaseId,e.path)}function Ti(t,e){const n=Ei(e);if(n.get(1)!==t.databaseId.projectId)throw new Te(be.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new Te(be.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new Ke(Ci(n))}function Ii(t,e){return wi(t.databaseId,e)}function Si(t){return new $e(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Ci(t){return _e(t.length>4&&"documents"===t.get(4),29091,{key:t.toString()}),t.popFirst(5)}function Ai(t,e,n){return{name:bi(t,e),fields:n.value.mapValue.fields}}function Di(t,e){return{documents:[Ii(t,e.path)]}}function Ni(t,e){const n={structuredQuery:{}},r=e.path;let s;null!==e.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Ii(t,s);const i=function(t){if(0!==t.length)return Pi(_r.create(t,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const o=function(t){if(0!==t.length)return t.map(t=>{return{field:Mi((e=t).field),direction:xi(e.dir)};var e})}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const a=pi(t,e.limit);return null!==a&&(n.structuredQuery.limit=a),e.startAt&&(n.structuredQuery.startAt={before:(c=e.startAt).inclusive,values:c.position}),e.endAt&&(n.structuredQuery.endAt=function(t){return{before:!t.inclusive,values:t.position}}(e.endAt)),{ft:n,parent:s};var c}function ki(t){let e=function(t){const e=Ei(t);return 4===e.length?$e.emptyPath():Ci(e)}(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){_e(1===r,65062);const t=n.from[0];t.allDescendants?s=t.collectionId:e=e.child(t.collectionId)}let i=[];n.where&&(i=function(t){const e=Ri(t);return e instanceof _r&&br(e)?e.getFilters():[e]}(n.where));let o=[];n.orderBy&&(o=n.orderBy.map(t=>{return new mr(Vi((e=t).field),function(t){switch(t){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(e.direction));var e}));let a=null;n.limit&&(a=function(t){let e;return e="object"==typeof t?t.value:t,pn(e)?null:e}(n.limit));let c=null;n.startAt&&(c=function(t){const e=!!t.before,n=t.values||[];return new fr(n,e)}(n.startAt));let u=null;return n.endAt&&(u=function(t){const e=!t.before,n=t.values||[];return new fr(n,e)}(n.endAt)),function(t,e,n,r,s,i,o,a){return new Ur(t,e,n,r,s,i,o,a)}(e,s,o,i,a,"F",c,u)}function Ri(t){return void 0!==t.unaryFilter?function(t){switch(t.unaryFilter.op){case"IS_NAN":const e=Vi(t.unaryFilter.field);return wr.create(e,"==",{doubleValue:NaN});case"IS_NULL":const n=Vi(t.unaryFilter.field);return wr.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=Vi(t.unaryFilter.field);return wr.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Vi(t.unaryFilter.field);return wr.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return ve(61313);default:return ve(60726)}}(t):void 0!==t.fieldFilter?(e=t,wr.create(Vi(e.fieldFilter.field),function(t){switch(t){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return ve(58110);default:return ve(50506)}}(e.fieldFilter.op),e.fieldFilter.value)):void 0!==t.compositeFilter?function(t){return _r.create(t.compositeFilter.filters.map(t=>Ri(t)),function(t){switch(t){case"AND":return"and";case"OR":return"or";default:return ve(1026)}}(t.compositeFilter.op))}(t):ve(30097,{filter:t});var e}function xi(t){return hi[t]}function Oi(t){return li[t]}function Li(t){return di[t]}function Mi(t){return{fieldPath:t.canonicalString()}}function Vi(t){return Ge.fromServerFormat(t.fieldPath)}function Pi(t){return t instanceof wr?function(t){if("=="===t.op){if(ar(t.value))return{unaryFilter:{field:Mi(t.field),op:"IS_NAN"}};if(or(t.value))return{unaryFilter:{field:Mi(t.field),op:"IS_NULL"}}}else if("!="===t.op){if(ar(t.value))return{unaryFilter:{field:Mi(t.field),op:"IS_NOT_NAN"}};if(or(t.value))return{unaryFilter:{field:Mi(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Mi(t.field),op:Oi(t.op),value:t.value}}}(t):t instanceof _r?function(t){const e=t.getFilters().map(t=>Pi(t));return 1===e.length?e[0]:{compositeFilter:{op:Li(t.op),filters:e}}}(t):ve(54877,{filter:t})}function Fi(t){const e=[];return t.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Ui(t){return t.length>=4&&"projects"===t.get(0)&&"databases"===t.get(2)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bi{constructor(t,e,n,r,s=sn.min(),i=sn.min(),o=Dn.EMPTY_BYTE_STRING,a=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=o,this.expectedCount=a}withSequenceNumber(t){return new Bi(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new Bi(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new Bi(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new Bi(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qi{constructor(t){this.yt=t}}function ji(t){const e=ki({parent:t.parent,structuredQuery:t.structuredQuery});return"LAST"===t.limitType?Kr(e,e.limit,"L"):e}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $i{constructor(){this.Cn=new zi}addToCollectionParentIndex(t,e){return this.Cn.add(e),ln.resolve()}getCollectionParents(t,e){return ln.resolve(this.Cn.getEntries(e))}addFieldIndex(t,e){return ln.resolve()}deleteFieldIndex(t,e){return ln.resolve()}deleteAllFieldIndexes(t){return ln.resolve()}createTargetIndexes(t,e){return ln.resolve()}getDocumentsMatchingTarget(t,e){return ln.resolve(null)}getIndexType(t,e){return ln.resolve(0)}getFieldIndexes(t,e){return ln.resolve([])}getNextCollectionGroupToUpdate(t){return ln.resolve(null)}getMinOffset(t,e){return ln.resolve(an.min())}getMinOffsetFromCollectionGroup(t,e){return ln.resolve(an.min())}updateCollectionGroup(t,e,n){return ln.resolve()}updateIndexEntries(t,e){return ln.resolve()}}class zi{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e]||new In($e.comparator),s=!r.has(n);return this.index[e]=r.add(n),s}has(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e];return r&&r.has(n)}getEntries(t){return(this.index[t]||new In($e.comparator)).toArray()}}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gi={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Ki=41943040;class Hi{static withCacheSize(t){return new Hi(t,Hi.DEFAULT_COLLECTION_PERCENTILE,Hi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Hi.DEFAULT_COLLECTION_PERCENTILE=10,Hi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Hi.DEFAULT=new Hi(Ki,Hi.DEFAULT_COLLECTION_PERCENTILE,Hi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Hi.DISABLED=new Hi(-1,0,0);
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qi{constructor(t){this.ar=t}next(){return this.ar+=2,this.ar}static ur(){return new Qi(0)}static cr(){return new Qi(-1)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wi="LruGarbageCollector";function Xi([t,e],[n,r]){const s=Me(t,n);return 0===s?Me(e,r):s}class Yi{constructor(t){this.Ir=t,this.buffer=new In(Xi),this.Er=0}dr(){return++this.Er}Ar(t){const e=[t,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(e);else{const t=this.buffer.last();Xi(e,t)<0&&(this.buffer=this.buffer.delete(t).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Ji{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.Rr=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return null!==this.Rr}Vr(t){pe(Wi,`Garbage collection scheduled in ${t}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){dn(t)?pe(Wi,"Ignoring IndexedDB error during garbage collection: ",t):await hn(t)}await this.Vr(3e5)})}}class Zi{constructor(t,e){this.mr=t,this.params=e}calculateTargetCount(t,e){return this.mr.gr(t).next(t=>Math.floor(e/100*t))}nthSequenceNumber(t,e){if(0===e)return ln.resolve(fn.ce);const n=new Yi(e);return this.mr.forEachTarget(t,t=>n.Ar(t.sequenceNumber)).next(()=>this.mr.pr(t,t=>n.Ar(t))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.mr.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.mr.removeOrphanedDocuments(t,e)}collect(t,e){return-1===this.params.cacheSizeCollectionThreshold?(pe("LruGarbageCollector","Garbage collection skipped; disabled"),ln.resolve(Gi)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(pe("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Gi):this.yr(t,e))}getCacheSize(t){return this.mr.getCacheSize(t)}yr(t,e){let n,r,s,i,o,a,c;const u=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(e=>(e>this.params.maximumSequenceNumbersToCollect?(pe("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${e}`),r=this.params.maximumSequenceNumbersToCollect):r=e,i=Date.now(),this.nthSequenceNumber(t,r))).next(r=>(n=r,o=Date.now(),this.removeTargets(t,n,e))).next(e=>(s=e,a=Date.now(),this.removeOrphanedDocuments(t,n))).next(t=>(c=Date.now(),fe()<=A.DEBUG&&pe("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-u}ms\n\tDetermined least recently used ${r} in `+(o-i)+`ms\n\tRemoved ${s} targets in `+(a-o)+`ms\n\tRemoved ${t} documents in `+(c-a)+`ms\nTotal Duration: ${c-u}ms`),ln.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:t})))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class to{constructor(){this.changes=new Zr(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,dr.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return void 0!==n?ln.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class no{constructor(t,e,n,r){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=r}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(r=>(n=r,this.remoteDocumentCache.getEntry(t,e))).next(t=>(null!==n&&Os(n.mutation,t,Cn.empty(),rn.now()),t))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(e=>this.getLocalViewOfDocuments(t,e,hs()).next(()=>e))}getLocalViewOfDocuments(t,e,n=hs()){const r=is();return this.populateOverlays(t,r,e).next(()=>this.computeViews(t,e,r,n).next(t=>{let e=rs();return t.forEach((t,n)=>{e=e.insert(t,n.overlayedDocument)}),e}))}getOverlayedDocuments(t,e){const n=is();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,hs()))}populateOverlays(t,e,n){const r=[];return n.forEach(t=>{e.has(t)||r.push(t)}),this.documentOverlayCache.getOverlays(t,r).next(t=>{t.forEach((t,n)=>{e.set(t,n)})})}computeViews(t,e,n,r){let s=es();const i=as(),o=as();return e.forEach((t,e)=>{const o=n.get(e.key);r.has(e.key)&&(void 0===o||o.mutation instanceof Ps)?s=s.insert(e.key,e):void 0!==o?(i.set(e.key,o.mutation.getFieldMask()),Os(o.mutation,e,o.mutation.getFieldMask(),rn.now())):i.set(e.key,Cn.empty())}),this.recalculateAndSaveOverlays(t,s).next(t=>(t.forEach((t,e)=>i.set(t,e)),e.forEach((t,e)=>o.set(t,new eo(e,i.get(t)??null))),o))}recalculateAndSaveOverlays(t,e){const n=as();let r=new En((t,e)=>t-e),s=hs();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(t=>{for(const s of t)s.keys().forEach(t=>{const i=e.get(t);if(null===i)return;let o=n.get(t)||Cn.empty();o=s.applyToLocalView(i,o),n.set(t,o);const a=(r.get(s.batchId)||hs()).add(t);r=r.insert(s.batchId,a)})}).next(()=>{const i=[],o=r.getReverseIterator();for(;o.hasNext();){const r=o.getNext(),a=r.key,c=r.value,u=os();c.forEach(t=>{if(!s.has(t)){const r=Rs(e.get(t),n.get(t));null!==r&&u.set(t,r),s=s.add(t)}}),i.push(this.documentOverlayCache.saveOverlays(t,a,u))}return ln.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(e=>this.recalculateAndSaveOverlays(t,e))}getDocumentsMatchingQuery(t,e,n,r){return s=e,Ke.isDocumentKey(s.path)&&null===s.collectionGroup&&0===s.filters.length?this.getDocumentsMatchingDocumentQuery(t,e.path):jr(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,r):this.getDocumentsMatchingCollectionQuery(t,e,n,r);var s}getNextDocuments(t,e,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,r).next(s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,r-s.size):ln.resolve(is());let o=-1,a=s;return i.next(e=>ln.forEach(e,(e,n)=>(o<n.largestBatchId&&(o=n.largestBatchId),s.get(e)?ln.resolve():this.remoteDocumentCache.getEntry(t,e).next(t=>{a=a.insert(e,t)}))).next(()=>this.populateOverlays(t,e,s)).next(()=>this.computeViews(t,a,e,hs())).next(t=>({batchId:o,changes:ss(t)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new Ke(e)).next(t=>{let e=rs();return t.isFoundDocument()&&(e=e.insert(t.key,t)),e})}getDocumentsMatchingCollectionGroupQuery(t,e,n,r){const s=e.collectionGroup;let i=rs();return this.indexManager.getCollectionParents(t,s).next(o=>ln.forEach(o,o=>{const a=(c=e,u=o.child(s),new Ur(u,null,c.explicitOrderBy.slice(),c.filters.slice(),c.limit,c.limitType,c.startAt,c.endAt));var c,u;return this.getDocumentsMatchingCollectionQuery(t,a,n,r).next(t=>{t.forEach((t,e)=>{i=i.insert(t,e)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(t,e,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,s,r))).next(t=>{s.forEach((e,n)=>{const r=n.getKey();null===t.get(r)&&(t=t.insert(r,dr.newInvalidDocument(r)))});let n=rs();return t.forEach((t,r)=>{const i=s.get(t);void 0!==i&&Os(i.mutation,r,Cn.empty(),rn.now()),Xr(e,r)&&(n=n.insert(t,r))}),n})}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ro{constructor(t){this.serializer=t,this.Lr=new Map,this.kr=new Map}getBundleMetadata(t,e){return ln.resolve(this.Lr.get(e))}saveBundleMetadata(t,e){return this.Lr.set(e.id,{id:(n=e).id,version:n.version,createTime:vi(n.createTime)}),ln.resolve();var n}getNamedQuery(t,e){return ln.resolve(this.kr.get(e))}saveNamedQuery(t,e){return this.kr.set(e.name,{name:(n=e).name,query:ji(n.bundledQuery),readTime:vi(n.readTime)}),ln.resolve();var n}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(){this.overlays=new En(Ke.comparator),this.qr=new Map}getOverlay(t,e){return ln.resolve(this.overlays.get(e))}getOverlays(t,e){const n=is();return ln.forEach(e,e=>this.getOverlay(t,e).next(t=>{null!==t&&n.set(e,t)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((n,r)=>{this.St(t,e,r)}),ln.resolve()}removeOverlaysForBatchId(t,e,n){const r=this.qr.get(n);return void 0!==r&&(r.forEach(t=>this.overlays=this.overlays.remove(t)),this.qr.delete(n)),ln.resolve()}getOverlaysForCollection(t,e,n){const r=is(),s=e.length+1,i=new Ke(e.child("")),o=this.overlays.getIteratorFrom(i);for(;o.hasNext();){const t=o.getNext().value,i=t.getKey();if(!e.isPrefixOf(i.path))break;i.path.length===s&&t.largestBatchId>n&&r.set(t.getKey(),t)}return ln.resolve(r)}getOverlaysForCollectionGroup(t,e,n,r){let s=new En((t,e)=>t-e);const i=this.overlays.getIterator();for(;i.hasNext();){const t=i.getNext().value;if(t.getKey().getCollectionGroup()===e&&t.largestBatchId>n){let e=s.get(t.largestBatchId);null===e&&(e=is(),s=s.insert(t.largestBatchId,e)),e.set(t.getKey(),t)}}const o=is(),a=s.getIterator();for(;a.hasNext()&&(a.getNext().value.forEach((t,e)=>o.set(t,e)),!(o.size()>=r)););return ln.resolve(o)}St(t,e,n){const r=this.overlays.get(n.key);if(null!==r){const t=this.qr.get(r.largestBatchId).delete(n.key);this.qr.set(r.largestBatchId,t)}this.overlays=this.overlays.insert(n.key,new Gs(e,n));let s=this.qr.get(e);void 0===s&&(s=hs(),this.qr.set(e,s)),this.qr.set(e,s.add(n.key))}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(){this.sessionToken=Dn.EMPTY_BYTE_STRING}getSessionToken(t){return ln.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,ln.resolve()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(){this.Qr=new In(ao.$r),this.Ur=new In(ao.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(t,e){const n=new ao(t,e);this.Qr=this.Qr.add(n),this.Ur=this.Ur.add(n)}Wr(t,e){t.forEach(t=>this.addReference(t,e))}removeReference(t,e){this.Gr(new ao(t,e))}zr(t,e){t.forEach(t=>this.removeReference(t,e))}jr(t){const e=new Ke(new $e([])),n=new ao(e,t),r=new ao(e,t+1),s=[];return this.Ur.forEachInRange([n,r],t=>{this.Gr(t),s.push(t.key)}),s}Jr(){this.Qr.forEach(t=>this.Gr(t))}Gr(t){this.Qr=this.Qr.delete(t),this.Ur=this.Ur.delete(t)}Hr(t){const e=new Ke(new $e([])),n=new ao(e,t),r=new ao(e,t+1);let s=hs();return this.Ur.forEachInRange([n,r],t=>{s=s.add(t.key)}),s}containsKey(t){const e=new ao(t,0),n=this.Qr.firstAfterOrEqual(e);return null!==n&&t.isEqual(n.key)}}class ao{constructor(t,e){this.key=t,this.Yr=e}static $r(t,e){return Ke.comparator(t.key,e.key)||Me(t.Yr,e.Yr)}static Kr(t,e){return Me(t.Yr,e.Yr)||Ke.comparator(t.key,e.key)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class co{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.tr=1,this.Zr=new In(ao.$r)}checkEmpty(t){return ln.resolve(0===this.mutationQueue.length)}addMutationBatch(t,e,n,r){const s=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new $s(s,e,n,r);this.mutationQueue.push(i);for(const o of r)this.Zr=this.Zr.add(new ao(o.key,s)),this.indexManager.addToCollectionParentIndex(t,o.key.path.popLast());return ln.resolve(i)}lookupMutationBatch(t,e){return ln.resolve(this.Xr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,r=this.ei(n),s=r<0?0:r;return ln.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return ln.resolve(0===this.mutationQueue.length?-1:this.tr-1)}getAllMutationBatches(t){return ln.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new ao(e,0),r=new ao(e,Number.POSITIVE_INFINITY),s=[];return this.Zr.forEachInRange([n,r],t=>{const e=this.Xr(t.Yr);s.push(e)}),ln.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new In(Me);return e.forEach(t=>{const e=new ao(t,0),r=new ao(t,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([e,r],t=>{n=n.add(t.Yr)})}),ln.resolve(this.ti(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,r=n.length+1;let s=n;Ke.isDocumentKey(s)||(s=s.child(""));const i=new ao(new Ke(s),0);let o=new In(Me);return this.Zr.forEachWhile(t=>{const e=t.key.path;return!!n.isPrefixOf(e)&&(e.length===r&&(o=o.add(t.Yr)),!0)},i),ln.resolve(this.ti(o))}ti(t){const e=[];return t.forEach(t=>{const n=this.Xr(t);null!==n&&e.push(n)}),e}removeMutationBatch(t,e){_e(0===this.ni(e.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.Zr;return ln.forEach(e.mutations,r=>{const s=new ao(r.key,e.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(t,r.key)}).next(()=>{this.Zr=n})}ir(t){}containsKey(t,e){const n=new ao(e,0),r=this.Zr.firstAfterOrEqual(n);return ln.resolve(e.isEqual(r&&r.key))}performConsistencyCheck(t){return this.mutationQueue.length,ln.resolve()}ni(t,e){return this.ei(t)}ei(t){return 0===this.mutationQueue.length?0:t-this.mutationQueue[0].batchId}Xr(t){const e=this.ei(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(t){this.ri=t,this.docs=new En(Ke.comparator),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,r=this.docs.get(n),s=r?r.size:0,i=this.ri(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return ln.resolve(n?n.document.mutableCopy():dr.newInvalidDocument(e))}getEntries(t,e){let n=es();return e.forEach(t=>{const e=this.docs.get(t);n=n.insert(t,e?e.document.mutableCopy():dr.newInvalidDocument(t))}),ln.resolve(n)}getDocumentsMatchingQuery(t,e,n,r){let s=es();const i=e.path,o=new Ke(i.child("__id-9223372036854775808__")),a=this.docs.getIteratorFrom(o);for(;a.hasNext();){const{key:t,value:{document:o}}=a.getNext();if(!i.isPrefixOf(t.path))break;t.path.length>i.length+1||cn(on(o),n)<=0||(r.has(o.key)||Xr(e,o))&&(s=s.insert(o.key,o.mutableCopy()))}return ln.resolve(s)}getAllFromCollectionGroup(t,e,n,r){ve(9500)}ii(t,e){return ln.forEach(this.docs,t=>e(t))}newChangeBuffer(t){return new ho(this)}getSize(t){return ln.resolve(this.size)}}class ho extends to{constructor(t){super(),this.Nr=t}applyChanges(t){const e=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?e.push(this.Nr.addEntry(t,r)):this.Nr.removeEntry(n)}),ln.waitFor(e)}getFromCache(t,e){return this.Nr.getEntry(t,e)}getAllFromCache(t,e){return this.Nr.getEntries(t,e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lo{constructor(t){this.persistence=t,this.si=new Zr(t=>Vr(t),Pr),this.lastRemoteSnapshotVersion=sn.min(),this.highestTargetId=0,this.oi=0,this._i=new oo,this.targetCount=0,this.ai=Qi.ur()}forEachTarget(t,e){return this.si.forEach((t,n)=>e(n)),ln.resolve()}getLastRemoteSnapshotVersion(t){return ln.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return ln.resolve(this.oi)}allocateTargetId(t){return this.highestTargetId=this.ai.next(),ln.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.oi&&(this.oi=e),ln.resolve()}Pr(t){this.si.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.ai=new Qi(e),this.highestTargetId=e),t.sequenceNumber>this.oi&&(this.oi=t.sequenceNumber)}addTargetData(t,e){return this.Pr(e),this.targetCount+=1,ln.resolve()}updateTargetData(t,e){return this.Pr(e),ln.resolve()}removeTargetData(t,e){return this.si.delete(e.target),this._i.jr(e.targetId),this.targetCount-=1,ln.resolve()}removeTargets(t,e,n){let r=0;const s=[];return this.si.forEach((i,o)=>{o.sequenceNumber<=e&&null===n.get(o.targetId)&&(this.si.delete(i),s.push(this.removeMatchingKeysForTargetId(t,o.targetId)),r++)}),ln.waitFor(s).next(()=>r)}getTargetCount(t){return ln.resolve(this.targetCount)}getTargetData(t,e){const n=this.si.get(e)||null;return ln.resolve(n)}addMatchingKeys(t,e,n){return this._i.Wr(e,n),ln.resolve()}removeMatchingKeys(t,e,n){this._i.zr(e,n);const r=this.persistence.referenceDelegate,s=[];return r&&e.forEach(e=>{s.push(r.markPotentiallyOrphaned(t,e))}),ln.waitFor(s)}removeMatchingKeysForTargetId(t,e){return this._i.jr(e),ln.resolve()}getMatchingKeysForTargetId(t,e){const n=this._i.Hr(e);return ln.resolve(n)}containsKey(t,e){return ln.resolve(this._i.containsKey(e))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(t,e){this.ui={},this.overlays={},this.ci=new fn(0),this.li=!1,this.li=!0,this.hi=new io,this.referenceDelegate=t(this),this.Pi=new lo(this),this.indexManager=new $i,this.remoteDocumentCache=new uo(t=>this.referenceDelegate.Ti(t)),this.serializer=new qi(e),this.Ii=new ro(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new so,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.ui[t.toKey()];return n||(n=new co(e,this.referenceDelegate),this.ui[t.toKey()]=n),n}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(t,e,n){pe("MemoryPersistence","Starting transaction:",t);const r=new po(this.ci.next());return this.referenceDelegate.Ei(),n(r).next(t=>this.referenceDelegate.di(r).next(()=>t)).toPromise().then(t=>(r.raiseOnCommittedEvent(),t))}Ai(t,e){return ln.or(Object.values(this.ui).map(n=>()=>n.containsKey(t,e)))}}class po extends un{constructor(t){super(),this.currentSequenceNumber=t}}class go{constructor(t){this.persistence=t,this.Ri=new oo,this.Vi=null}static mi(t){return new go(t)}get fi(){if(this.Vi)return this.Vi;throw ve(60996)}addReference(t,e,n){return this.Ri.addReference(n,e),this.fi.delete(n.toString()),ln.resolve()}removeReference(t,e,n){return this.Ri.removeReference(n,e),this.fi.add(n.toString()),ln.resolve()}markPotentiallyOrphaned(t,e){return this.fi.add(e.toString()),ln.resolve()}removeTarget(t,e){this.Ri.jr(e.targetId).forEach(t=>this.fi.add(t.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(t=>{t.forEach(t=>this.fi.add(t.toString()))}).next(()=>n.removeTargetData(t,e))}Ei(){this.Vi=new Set}di(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return ln.forEach(this.fi,n=>{const r=Ke.fromPath(n);return this.gi(t,r).next(t=>{t||e.removeEntry(r,sn.min())})}).next(()=>(this.Vi=null,e.apply(t)))}updateLimboDocument(t,e){return this.gi(t,e).next(t=>{t?this.fi.delete(e.toString()):this.fi.add(e.toString())})}Ti(t){return 0}gi(t,e){return ln.or([()=>ln.resolve(this.Ri.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ai(t,e)])}}class mo{constructor(t,e){this.persistence=t,this.pi=new Zr(t=>function(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=yn(e)),e=mn(t.get(n),e);return yn(e)}(t.path),(t,e)=>t.isEqual(e)),this.garbageCollector=function(t,e){return new Zi(t,e)}(this,e)}static mi(t,e){return new mo(t,e)}Ei(){}di(t){return ln.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}gr(t){const e=this.wr(t);return this.persistence.getTargetCache().getTargetCount(t).next(t=>e.next(e=>t+e))}wr(t){let e=0;return this.pr(t,t=>{e++}).next(()=>e)}pr(t,e){return ln.forEach(this.pi,(n,r)=>this.br(t,n,r).next(t=>t?ln.resolve():e(r)))}removeTargets(t,e,n){return this.persistence.getTargetCache().removeTargets(t,e,n)}removeOrphanedDocuments(t,e){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ii(t,r=>this.br(t,r,e).next(t=>{t||(n++,s.removeEntry(r,sn.min()))})).next(()=>s.apply(t)).next(()=>n)}markPotentiallyOrphaned(t,e){return this.pi.set(e,t.currentSequenceNumber),ln.resolve()}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,n)}addReference(t,e,n){return this.pi.set(n,t.currentSequenceNumber),ln.resolve()}removeReference(t,e,n){return this.pi.set(n,t.currentSequenceNumber),ln.resolve()}updateLimboDocument(t,e){return this.pi.set(e,t.currentSequenceNumber),ln.resolve()}Ti(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=nr(t.data.value)),e}br(t,e,n){return ln.or([()=>this.persistence.Ai(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const t=this.pi.get(e);return ln.resolve(void 0!==t&&t>n)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo{constructor(t,e,n,r){this.targetId=t,this.fromCache=e,this.Es=n,this.ds=r}static As(t,e){let n=hs(),r=hs();for(const s of e.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new yo(t,e.fromCache,n,r)}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wo{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=m()?8:function(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}("undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:"")>0?6:4}initialize(t,e){this.ps=t,this.indexManager=e,this.Rs=!0}getDocumentsMatchingQuery(t,e,n,r){const s={result:null};return this.ys(t,e).next(t=>{s.result=t}).next(()=>{if(!s.result)return this.ws(t,e,r,n).next(t=>{s.result=t})}).next(()=>{if(s.result)return;const n=new vo;return this.Ss(t,e,n).next(r=>{if(s.result=r,this.Vs)return this.bs(t,e,n,r.size)})}).next(()=>s.result)}bs(t,e,n,r){return n.documentReadCount<this.fs?(fe()<=A.DEBUG&&pe("QueryEngine","SDK will not create cache indexes for query:",Wr(e),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),ln.resolve()):(fe()<=A.DEBUG&&pe("QueryEngine","Query:",Wr(e),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.gs*r?(fe()<=A.DEBUG&&pe("QueryEngine","The SDK decides to create cache indexes for query:",Wr(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,zr(e))):ln.resolve())}ys(t,e){if(qr(e))return ln.resolve(null);let n=zr(e);return this.indexManager.getIndexType(t,n).next(r=>0===r?null:(null!==e.limit&&1===r&&(e=Kr(e,null,"F"),n=zr(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(r=>{const s=hs(...r);return this.ps.getDocuments(t,s).next(r=>this.indexManager.getMinOffset(t,n).next(n=>{const i=this.Ds(e,r);return this.Cs(e,i,s,n.readTime)?this.ys(t,Kr(e,null,"F")):this.vs(t,i,e,n)}))})))}ws(t,e,n,r){return qr(e)||r.isEqual(sn.min())?ln.resolve(null):this.ps.getDocuments(t,n).next(s=>{const i=this.Ds(e,s);return this.Cs(e,i,n,r)?ln.resolve(null):(fe()<=A.DEBUG&&pe("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Wr(e)),this.vs(t,i,e,function(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=sn.fromTimestamp(1e9===r?new rn(n+1,0):new rn(n,r));return new an(s,Ke.empty(),e)}(r,-1)).next(t=>t))})}Ds(t,e){let n=new In(Yr(t));return e.forEach((e,r)=>{Xr(t,r)&&(n=n.add(r))}),n}Cs(t,e,n,r){if(null===t.limit)return!1;if(n.size!==e.size)return!0;const s="F"===t.limitType?e.last():e.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}Ss(t,e,n){return fe()<=A.DEBUG&&pe("QueryEngine","Using full collection scan to execute query:",Wr(e)),this.ps.getDocumentsMatchingQuery(t,e,an.min(),n)}vs(t,e,n,r){return this.ps.getDocumentsMatchingQuery(t,n,r).next(t=>(e.forEach(e=>{t=t.insert(e.key,e)}),t))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _o="LocalStore";class Eo{constructor(t,e,n,r){this.persistence=t,this.Fs=e,this.serializer=r,this.Ms=new En(Me),this.xs=new Zr(t=>Vr(t),Pr),this.Os=new Map,this.Ns=t.getRemoteDocumentCache(),this.Pi=t.getTargetCache(),this.Ii=t.getBundleCache(),this.Bs(n)}Bs(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new no(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.Ms))}}async function bo(t,e){const n=Ee(t);return await n.persistence.runTransaction("Handle user change","readonly",t=>{let r;return n.mutationQueue.getAllMutationBatches(t).next(s=>(r=s,n.Bs(e),n.mutationQueue.getAllMutationBatches(t))).next(e=>{const s=[],i=[];let o=hs();for(const t of r){s.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}for(const t of e){i.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}return n.localDocuments.getDocuments(t,o).next(t=>({Ls:t,removedBatchIds:s,addedBatchIds:i}))})})}function To(t){const e=Ee(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Pi.getLastRemoteSnapshotVersion(t))}function Io(t,e){const n=Ee(t),r=e.snapshotVersion;let s=n.Ms;return n.persistence.runTransaction("Apply remote event","readwrite-primary",t=>{const i=n.Ns.newChangeBuffer({trackRemovals:!0});s=n.Ms;const o=[];e.targetChanges.forEach((i,a)=>{const c=s.get(a);if(!c)return;o.push(n.Pi.removeMatchingKeys(t,i.removedDocuments,a).next(()=>n.Pi.addMatchingKeys(t,i.addedDocuments,a)));let u=c.withSequenceNumber(t.currentSequenceNumber);null!==e.targetMismatches.get(a)?u=u.withResumeToken(Dn.EMPTY_BYTE_STRING,sn.min()).withLastLimboFreeSnapshotVersion(sn.min()):i.resumeToken.approximateByteSize()>0&&(u=u.withResumeToken(i.resumeToken,r)),s=s.insert(a,u),function(t,e,n){if(0===t.resumeToken.approximateByteSize())return!0;if(e.snapshotVersion.toMicroseconds()-t.snapshotVersion.toMicroseconds()>=3e8)return!0;return n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0}(c,u,i)&&o.push(n.Pi.updateTargetData(t,u))});let a=es(),c=hs();if(e.documentUpdates.forEach(r=>{e.resolvedLimboDocuments.has(r)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(t,r))}),o.push(function(t,e,n){let r=hs(),s=hs();return n.forEach(t=>r=r.add(t)),e.getEntries(t,r).next(t=>{let r=es();return n.forEach((n,i)=>{const o=t.get(n);i.isFoundDocument()!==o.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(sn.min())?(e.removeEntry(n,i.readTime),r=r.insert(n,i)):!o.isValidDocument()||i.version.compareTo(o.version)>0||0===i.version.compareTo(o.version)&&o.hasPendingWrites?(e.addEntry(i),r=r.insert(n,i)):pe(_o,"Ignoring outdated watch update for ",n,". Current version:",o.version," Watch version:",i.version)}),{ks:r,qs:s}})}(t,i,e.documentUpdates).next(t=>{a=t.ks,c=t.qs})),!r.isEqual(sn.min())){const e=n.Pi.getLastRemoteSnapshotVersion(t).next(e=>n.Pi.setTargetsMetadata(t,t.currentSequenceNumber,r));o.push(e)}return ln.waitFor(o).next(()=>i.apply(t)).next(()=>n.localDocuments.getLocalViewOfDocuments(t,a,c)).next(()=>a)}).then(t=>(n.Ms=s,t))}function So(t,e){const n=Ee(t);return n.persistence.runTransaction("Get next mutation batch","readonly",t=>(void 0===e&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(t,e)))}async function Co(t,e,n){const r=Ee(t),s=r.Ms.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,t=>r.persistence.referenceDelegate.removeTarget(t,s))}catch(o){if(!dn(o))throw o;pe(_o,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Ms=r.Ms.remove(e),r.xs.delete(s.target)}function Ao(t,e,n){const r=Ee(t);let s=sn.min(),i=hs();return r.persistence.runTransaction("Execute query","readwrite",t=>function(t,e,n){const r=Ee(t),s=r.xs.get(n);return void 0!==s?ln.resolve(r.Ms.get(s)):r.Pi.getTargetData(e,n)}(r,t,zr(e)).next(e=>{if(e)return s=e.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(t,e.targetId).next(t=>{i=t})}).next(()=>r.Fs.getDocumentsMatchingQuery(t,e,n?s:sn.min(),n?i:hs())).next(t=>(function(t,e,n){let r=t.Os.get(e)||sn.min();n.forEach((t,e)=>{e.readTime.compareTo(r)>0&&(r=e.readTime)}),t.Os.set(e,r)}(r,function(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}(e),t),{documents:t,Qs:i})))}class Do{constructor(){this.activeTargetIds=ls}zs(t){this.activeTargetIds=this.activeTargetIds.add(t)}js(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Gs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class No{constructor(){this.Mo=new Do,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.Mo.zs(t),this.xo[t]||"not-current"}updateQueryState(t,e,n){this.xo[t]=e}removeLocalQueryTarget(t){this.Mo.js(t)}isLocalQueryTarget(t){return this.Mo.activeTargetIds.has(t)}clearQueryState(t){delete this.xo[t]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(t){return this.Mo.activeTargetIds.has(t)}start(){return this.Mo=new Do,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{Oo(t){}shutdown(){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ro="ConnectivityMonitor";class xo{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(t){this.qo.push(t)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){pe(Ro,"Network connectivity changed: AVAILABLE");for(const t of this.qo)t(0)}ko(){pe(Ro,"Network connectivity changed: UNAVAILABLE");for(const t of this.qo)t(1)}static v(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Oo=null;function Lo(){return null===Oo?Oo=268435456+Math.round(2147483648*Math.random()):Oo++,"0x"+Oo.toString(16)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Mo="RestConnection",Vo={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class Po{get $o(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.Uo=e+"://"+t.host,this.Ko=`projects/${n}/databases/${r}`,this.Wo=this.databaseId.database===qn?`project_id=${n}`:`project_id=${n}&database_id=${r}`}Go(t,e,n,r,s){const i=Lo(),o=this.zo(t,e.toUriEncodedString());pe(Mo,`Sending RPC '${t}' ${i}:`,o,n);const a={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(a,r,s);const{host:c}=new URL(o),u=l(c);return this.Jo(t,o,a,n,u).then(e=>(pe(Mo,`Received RPC '${t}' ${i}: `,e),e),e=>{throw me(Mo,`RPC '${t}' ${i} failed with error: `,e,"url: ",o,"request:",n),e})}Ho(t,e,n,r,s,i){return this.Go(t,e,n,r,s)}jo(t,e,n){t["X-Goog-Api-Client"]="gl-js/ fire/"+le,t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((e,n)=>t[n]=e),n&&n.headers.forEach((e,n)=>t[n]=e)}zo(t,e){const n=Vo[t];return`${this.Uo}/v1/${e}:${n}`}terminate(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fo{constructor(t){this.Yo=t.Yo,this.Zo=t.Zo}Xo(t){this.e_=t}t_(t){this.n_=t}r_(t){this.i_=t}onMessage(t){this.s_=t}close(){this.Zo()}send(t){this.Yo(t)}o_(){this.e_()}__(){this.n_()}a_(t){this.i_(t)}u_(t){this.s_(t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uo="WebChannelConnection";class Bo extends Po{constructor(t){super(t),this.c_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}Jo(t,e,n,r,s){const i=Lo();return new Promise((s,o)=>{const a=new Zt;a.setWithCredentials(!0),a.listenOnce(ee.COMPLETE,()=>{try{switch(a.getLastErrorCode()){case ne.NO_ERROR:const e=a.getResponseJson();pe(Uo,`XHR for RPC '${t}' ${i} received:`,JSON.stringify(e)),s(e);break;case ne.TIMEOUT:pe(Uo,`RPC '${t}' ${i} timed out`),o(new Te(be.DEADLINE_EXCEEDED,"Request time out"));break;case ne.HTTP_ERROR:const n=a.getStatus();if(pe(Uo,`RPC '${t}' ${i} failed with status:`,n,"response text:",a.getResponseText()),n>0){let t=a.getResponseJson();Array.isArray(t)&&(t=t[0]);const e=t?.error;if(e&&e.status&&e.message){const t=function(t){const e=t.toLowerCase().replace(/_/g,"-");return Object.values(be).indexOf(e)>=0?e:be.UNKNOWN}(e.status);o(new Te(t,e.message))}else o(new Te(be.UNKNOWN,"Server responded with status "+a.getStatus()))}else o(new Te(be.UNAVAILABLE,"Connection failed."));break;default:ve(9055,{l_:t,streamId:i,h_:a.getLastErrorCode(),P_:a.getLastError()})}}finally{pe(Uo,`RPC '${t}' ${i} completed.`)}});const c=JSON.stringify(r);pe(Uo,`RPC '${t}' ${i} sending request:`,r),a.send(e,"POST",c,n,15)})}T_(t,e,n){const r=Lo(),s=[this.Uo,"/","google.firestore.v1.Firestore","/",t,"/channel"],i=oe(),o=ie(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;void 0!==c&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.jo(a.initMessageHeaders,e,n),a.encodeInitMessageHeaders=!0;const u=s.join("");pe(Uo,`Creating RPC '${t}' stream ${r}: ${u}`,a);const h=i.createWebChannel(u,a);this.I_(h);let l=!1,d=!1;const f=new Fo({Yo:e=>{d?pe(Uo,`Not sending because RPC '${t}' stream ${r} is closed:`,e):(l||(pe(Uo,`Opening RPC '${t}' stream ${r} transport.`),h.open(),l=!0),pe(Uo,`RPC '${t}' stream ${r} sending:`,e),h.send(e))},Zo:()=>h.close()}),p=(t,e,n)=>{t.listen(e,t=>{try{n(t)}catch(e){setTimeout(()=>{throw e},0)}})};return p(h,te.EventType.OPEN,()=>{d||(pe(Uo,`RPC '${t}' stream ${r} transport opened.`),f.o_())}),p(h,te.EventType.CLOSE,()=>{d||(d=!0,pe(Uo,`RPC '${t}' stream ${r} transport closed`),f.a_(),this.E_(h))}),p(h,te.EventType.ERROR,e=>{d||(d=!0,me(Uo,`RPC '${t}' stream ${r} transport errored. Name:`,e.name,"Message:",e.message),f.a_(new Te(be.UNAVAILABLE,"The operation could not be completed")))}),p(h,te.EventType.MESSAGE,e=>{if(!d){const n=e.data[0];_e(!!n,16349);const s=n,i=s?.error||s[0]?.error;if(i){pe(Uo,`RPC '${t}' stream ${r} received error:`,i);const e=i.status;let n=function(t){const e=Hs[t];if(void 0!==e)return Ws(e)}(e),s=i.message;void 0===n&&(n=be.INTERNAL,s="Unknown error status: "+e+" with message "+i.message),d=!0,f.a_(new Te(n,s)),h.close()}else pe(Uo,`RPC '${t}' stream ${r} received:`,n),f.u_(n)}}),p(o,se.STAT_EVENT,e=>{e.stat===re.PROXY?pe(Uo,`RPC '${t}' stream ${r} detected buffering proxy`):e.stat===re.NOPROXY&&pe(Uo,`RPC '${t}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{f.__()},0),f}terminate(){this.c_.forEach(t=>t.close()),this.c_=[]}I_(t){this.c_.push(t)}E_(t){this.c_=this.c_.filter(e=>e===t)}}function qo(){return"undefined"!=typeof document?document:null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jo(t){return new fi(t,!0)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(t,e,n=1e3,r=1.5,s=6e4){this.Mi=t,this.timerId=e,this.d_=n,this.A_=r,this.R_=s,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(t){this.cancel();const e=Math.floor(this.V_+this.y_()),n=Math.max(0,Date.now()-this.f_),r=Math.max(0,e-n);r>0&&pe("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.V_} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),t())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){null!==this.m_&&(this.m_.skipDelay(),this.m_=null)}cancel(){null!==this.m_&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo="PersistentStream";class Go{constructor(t,e,n,r,s,i,o,a){this.Mi=t,this.S_=n,this.b_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new $o(t,e)}x_(){return 1===this.state||5===this.state||this.O_()}O_(){return 2===this.state||3===this.state}start(){this.F_=0,4!==this.state?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&null===this.C_&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(t){this.Q_(),this.stream.send(t)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,4!==t?this.M_.reset():e&&e.code===be.RESOURCE_EXHAUSTED?(ge(e.toString()),ge("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):e&&e.code===be.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.K_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.r_(e)}K_(){}auth(){this.state=1;const t=this.W_(this.D_),e=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([t,n])=>{this.D_===e&&this.G_(t,n)},e=>{t(()=>{const t=new Te(be.UNKNOWN,"Fetching auth token failed: "+e.message);return this.z_(t)})})}G_(t,e){const n=this.W_(this.D_);this.stream=this.j_(t,e),this.stream.Xo(()=>{n(()=>this.listener.Xo())}),this.stream.t_(()=>{n(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(t=>{n(()=>this.z_(t))}),this.stream.onMessage(t=>{n(()=>1==++this.F_?this.J_(t):this.onNext(t))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(t){return pe(zo,`close with error: ${t}`),this.stream=null,this.close(4,t)}W_(t){return e=>{this.Mi.enqueueAndForget(()=>this.D_===t?e():(pe(zo,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Ko extends Go{constructor(t,e,n,r,s,i){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,r,i),this.serializer=s}j_(t,e){return this.connection.T_("Listen",t,e)}J_(t){return this.onNext(t)}onNext(t){this.M_.reset();const e=function(t,e){let n;if("targetChange"in e){e.targetChange;const s="NO_CHANGE"===(r=e.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===r?1:"REMOVE"===r?2:"CURRENT"===r?3:"RESET"===r?4:ve(39313,{state:r}),i=e.targetChange.targetIds||[],o=function(t,e){return t.useProto3Json?(_e(void 0===e||"string"==typeof e,58123),Dn.fromBase64String(e||"")):(_e(void 0===e||e instanceof Buffer||e instanceof Uint8Array,16193),Dn.fromUint8Array(e||new Uint8Array))}(t,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(t){const e=void 0===t.code?be.UNKNOWN:Ws(t.code);return new Te(e,t.message||"")}(a);n=new ii(s,i,o,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ti(t,r.document.name),i=vi(r.document.updateTime),o=r.document.createTime?vi(r.document.createTime):sn.min(),a=new hr({mapValue:{fields:r.document.fields}}),c=dr.newFoundDocument(s,i,o,a),u=r.targetIds||[],h=r.removedTargetIds||[];n=new ri(u,h,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Ti(t,r.document),i=r.readTime?vi(r.readTime):sn.min(),o=dr.newNoDocument(s,i),a=r.removedTargetIds||[];n=new ri([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Ti(t,r.document),i=r.removedTargetIds||[];n=new ri([],i,s,null)}else{if(!("filter"in e))return ve(11601,{Rt:e});{e.filter;const t=e.filter;t.targetId;const{count:r=0,unchangedNames:s}=t,i=new Ks(r,s),o=t.targetId;n=new si(o,i)}}var r;return n}(this.serializer,t),n=function(t){if(!("targetChange"in t))return sn.min();const e=t.targetChange;return e.targetIds&&e.targetIds.length?sn.min():e.readTime?vi(e.readTime):sn.min()}(t);return this.listener.H_(e,n)}Y_(t){const e={};e.database=Si(this.serializer),e.addTarget=function(t,e){let n;const r=e.target;if(n=Fr(r)?{documents:Di(t,r)}:{query:Ni(t,r).ft},n.targetId=e.targetId,e.resumeToken.approximateByteSize()>0){n.resumeToken=mi(t,e.resumeToken);const r=pi(t,e.expectedCount);null!==r&&(n.expectedCount=r)}else if(e.snapshotVersion.compareTo(sn.min())>0){n.readTime=gi(t,e.snapshotVersion.toTimestamp());const r=pi(t,e.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,t);const n=function(t,e){const n=function(t){switch(t){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return ve(28987,{purpose:t})}}(e.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,t);n&&(e.labels=n),this.q_(e)}Z_(t){const e={};e.database=Si(this.serializer),e.removeTarget=t,this.q_(e)}}class Ho extends Go{constructor(t,e,n,r,s,i){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,r,i),this.serializer=s}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(t,e){return this.connection.T_("Write",t,e)}J_(t){return _e(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,_e(!t.writeResults||0===t.writeResults.length,55816),this.listener.ta()}onNext(t){_e(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.M_.reset();const e=function(t,e){return t&&t.length>0?(_e(void 0!==e,14353),t.map(t=>function(t,e){let n=t.updateTime?vi(t.updateTime):vi(e);return n.isEqual(sn.min())&&(n=vi(e)),new As(n,t.transformResults||[])}(t,e))):[]}(t.writeResults,t.commitTime),n=vi(t.commitTime);return this.listener.na(n,e)}ra(){const t={};t.database=Si(this.serializer),this.q_(t)}ea(t){const e={streamToken:this.lastStreamToken,writes:t.map(t=>function(t,e){let n;if(e instanceof Vs)n={update:Ai(t,e.key,e.value)};else if(e instanceof qs)n={delete:bi(t,e.key)};else if(e instanceof Ps)n={update:Ai(t,e.key,e.data),updateMask:Fi(e.fieldMask)};else{if(!(e instanceof js))return ve(16599,{Vt:e.type});n={verify:bi(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(t=>function(t,e){const n=e.transform;if(n instanceof ws)return{fieldPath:e.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof _s)return{fieldPath:e.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof bs)return{fieldPath:e.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof Is)return{fieldPath:e.field.canonicalString(),increment:n.Ae};throw ve(20930,{transform:e.transform})}(0,t))),e.precondition.isNone||(n.currentDocument=(r=t,void 0!==(s=e.precondition).updateTime?{updateTime:yi(r,s.updateTime)}:void 0!==s.exists?{exists:s.exists}:ve(27497))),n;var r,s}(this.serializer,t))};this.q_(e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qo{}class Wo extends Qo{constructor(t,e,n,r){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new Te(be.FAILED_PRECONDITION,"The client has already been terminated.")}Go(t,e,n,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Go(t,_i(e,n),r,s,i)).catch(t=>{throw"FirebaseError"===t.name?(t.code===be.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new Te(be.UNKNOWN,t.toString())})}Ho(t,e,n,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Ho(t,_i(e,n),r,i,o,s)).catch(t=>{throw"FirebaseError"===t.name?(t.code===be.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new Te(be.UNKNOWN,t.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class Xo{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){0===this.oa&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(t){"Online"===this.state?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ca("Offline")))}set(t){this.Pa(),this.oa=0,"Online"===t&&(this.aa=!1),this.ca(t)}ca(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}la(t){const e=`Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(ge(e),this.aa=!1):pe("OnlineStateTracker",e)}Pa(){null!==this._a&&(this._a.cancel(),this._a=null)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yo="RemoteStore";class Jo{constructor(t,e,n,r,s){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=s,this.Aa.Oo(t=>{n.enqueueAndForget(async()=>{aa(this)&&(pe(Yo,"Restarting streams for network reachability change."),await async function(t){const e=Ee(t);e.Ea.add(4),await ta(e),e.Ra.set("Unknown"),e.Ea.delete(4),await Zo(e)}(this))})}),this.Ra=new Xo(n,r)}}async function Zo(t){if(aa(t))for(const e of t.da)await e(!0)}async function ta(t){for(const e of t.da)await e(!1)}function ea(t,e){const n=Ee(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),oa(n)?ia(n):Sa(n).O_()&&ra(n,e))}function na(t,e){const n=Ee(t),r=Sa(n);n.Ia.delete(e),r.O_()&&sa(n,e),0===n.Ia.size&&(r.O_()?r.L_():aa(n)&&n.Ra.set("Unknown"))}function ra(t,e){if(t.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(sn.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Sa(t).Y_(e)}function sa(t,e){t.Va.Ue(e),Sa(t).Z_(e)}function ia(t){t.Va=new ai({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),Sa(t).start(),t.Ra.ua()}function oa(t){return aa(t)&&!Sa(t).x_()&&t.Ia.size>0}function aa(t){return 0===Ee(t).Ea.size}function ca(t){t.Va=void 0}async function ua(t){t.Ra.set("Online")}async function ha(t){t.Ia.forEach((e,n)=>{ra(t,e)})}async function la(t,e){ca(t),oa(t)?(t.Ra.ha(e),ia(t)):t.Ra.set("Unknown")}async function da(t,e,n){if(t.Ra.set("Online"),e instanceof ii&&2===e.state&&e.cause)try{await async function(t,e){const n=e.cause;for(const r of e.targetIds)t.Ia.has(r)&&(await t.remoteSyncer.rejectListen(r,n),t.Ia.delete(r),t.Va.removeTarget(r))}(t,e)}catch(r){pe(Yo,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await fa(t,r)}else if(e instanceof ri?t.Va.Ze(e):e instanceof si?t.Va.st(e):t.Va.tt(e),!n.isEqual(sn.min()))try{const e=await To(t.localStore);n.compareTo(e)>=0&&await function(t,e){const n=t.Va.Tt(e);return n.targetChanges.forEach((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=t.Ia.get(r);s&&t.Ia.set(r,s.withResumeToken(n.resumeToken,e))}}),n.targetMismatches.forEach((e,n)=>{const r=t.Ia.get(e);if(!r)return;t.Ia.set(e,r.withResumeToken(Dn.EMPTY_BYTE_STRING,r.snapshotVersion)),sa(t,e);const s=new Bi(r.target,e,n,r.sequenceNumber);ra(t,s)}),t.remoteSyncer.applyRemoteEvent(n)}(t,n)}catch(s){pe(Yo,"Failed to raise snapshot:",s),await fa(t,s)}}async function fa(t,e,n){if(!dn(e))throw e;t.Ea.add(1),await ta(t),t.Ra.set("Offline"),n||(n=()=>To(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{pe(Yo,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await Zo(t)})}function pa(t,e){return e().catch(n=>fa(t,n,e))}async function ga(t){const e=Ee(t),n=Ca(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:-1;for(;ma(e);)try{const t=await So(e.localStore,r);if(null===t){0===e.Ta.length&&n.L_();break}r=t.batchId,ya(e,t)}catch(s){await fa(e,s)}va(e)&&wa(e)}function ma(t){return aa(t)&&t.Ta.length<10}function ya(t,e){t.Ta.push(e);const n=Ca(t);n.O_()&&n.X_&&n.ea(e.mutations)}function va(t){return aa(t)&&!Ca(t).x_()&&t.Ta.length>0}function wa(t){Ca(t).start()}async function _a(t){Ca(t).ra()}async function Ea(t){const e=Ca(t);for(const n of t.Ta)e.ea(n.mutations)}async function ba(t,e,n){const r=t.Ta.shift(),s=zs.from(r,e,n);await pa(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await ga(t)}async function Ta(t,e){e&&Ca(t).X_&&await async function(t,e){if(function(t){switch(t){case be.OK:return ve(64938);case be.CANCELLED:case be.UNKNOWN:case be.DEADLINE_EXCEEDED:case be.RESOURCE_EXHAUSTED:case be.INTERNAL:case be.UNAVAILABLE:case be.UNAUTHENTICATED:return!1;case be.INVALID_ARGUMENT:case be.NOT_FOUND:case be.ALREADY_EXISTS:case be.PERMISSION_DENIED:case be.FAILED_PRECONDITION:case be.ABORTED:case be.OUT_OF_RANGE:case be.UNIMPLEMENTED:case be.DATA_LOSS:return!0;default:return ve(15467,{code:t})}}(n=e.code)&&n!==be.ABORTED){const n=t.Ta.shift();Ca(t).B_(),await pa(t,()=>t.remoteSyncer.rejectFailedWrite(n.batchId,e)),await ga(t)}var n}(t,e),va(t)&&wa(t)}async function Ia(t,e){const n=Ee(t);n.asyncQueue.verifyOperationInProgress(),pe(Yo,"RemoteStore received new credentials");const r=aa(n);n.Ea.add(3),await ta(n),r&&n.Ra.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await Zo(n)}function Sa(t){return t.ma||(t.ma=function(t,e,n){const r=Ee(t);return r.sa(),new Ko(e,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(t.datastore,t.asyncQueue,{Xo:ua.bind(null,t),t_:ha.bind(null,t),r_:la.bind(null,t),H_:da.bind(null,t)}),t.da.push(async e=>{e?(t.ma.B_(),oa(t)?ia(t):t.Ra.set("Unknown")):(await t.ma.stop(),ca(t))})),t.ma}function Ca(t){return t.fa||(t.fa=function(t,e,n){const r=Ee(t);return r.sa(),new Ho(e,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(t.datastore,t.asyncQueue,{Xo:()=>Promise.resolve(),t_:_a.bind(null,t),r_:Ta.bind(null,t),ta:Ea.bind(null,t),na:ba.bind(null,t)}),t.da.push(async e=>{e?(t.fa.B_(),await ga(t)):(await t.fa.stop(),t.Ta.length>0&&(pe(Yo,`Stopping write stream with ${t.Ta.length} pending writes`),t.Ta=[]))})),t.fa
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class Aa{constructor(t,e,n,r,s){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new Ie,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(t=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,r,s){const i=Date.now()+n,o=new Aa(t,e,i,r,s);return o.start(n),o}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new Te(be.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Da(t,e){if(ge("AsyncQueue",`${e}: ${t}`),dn(t))return new Te(be.UNAVAILABLE,`${e}: ${t}`);throw t}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Na{static emptySet(t){return new Na(t.comparator)}constructor(t){this.comparator=t?(e,n)=>t(e,n)||Ke.comparator(e.key,n.key):(t,e)=>Ke.comparator(t.key,e.key),this.keyedMap=rs(),this.sortedSet=new En(this.comparator)}has(t){return null!=this.keyedMap.get(t)}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Na))return!1;if(this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(!t.isEqual(r))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),0===t.length?"DocumentSet ()":"DocumentSet (\n  "+t.join("  \n")+"\n)"}copy(t,e){const n=new Na;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka{constructor(){this.ga=new En(Ke.comparator)}track(t){const e=t.doc.key,n=this.ga.get(e);n?0!==t.type&&3===n.type?this.ga=this.ga.insert(e,t):3===t.type&&1!==n.type?this.ga=this.ga.insert(e,{type:n.type,doc:t.doc}):2===t.type&&2===n.type?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):2===t.type&&0===n.type?this.ga=this.ga.insert(e,{type:0,doc:t.doc}):1===t.type&&0===n.type?this.ga=this.ga.remove(e):1===t.type&&2===n.type?this.ga=this.ga.insert(e,{type:1,doc:n.doc}):0===t.type&&1===n.type?this.ga=this.ga.insert(e,{type:2,doc:t.doc}):ve(63341,{Rt:t,pa:n}):this.ga=this.ga.insert(e,t)}ya(){const t=[];return this.ga.inorderTraversal((e,n)=>{t.push(n)}),t}}class Ra{constructor(t,e,n,r,s,i,o,a,c){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=o,this.excludesMetadataChanges=a,this.hasCachedResults=c}static fromInitialDocuments(t,e,n,r,s){const i=[];return e.forEach(t=>{i.push({type:0,doc:t})}),new Ra(t,e,Na.emptySet(e),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Hr(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let r=0;r<e.length;r++)if(e[r].type!==n[r].type||!e[r].doc.isEqual(n[r].doc))return!1;return!0}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xa{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(t=>t.Da())}}class Oa{constructor(){this.queries=La(),this.onlineState="Unknown",this.Ca=new Set}terminate(){!function(t,e){const n=Ee(t),r=n.queries;n.queries=La(),r.forEach((t,n)=>{for(const r of n.Sa)r.onError(e)})}(this,new Te(be.ABORTED,"Firestore shutting down"))}}function La(){return new Zr(t=>Qr(t),Hr)}async function Ma(t,e){const n=Ee(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.ba()&&e.Da()&&(r=2):(i=new xa,r=e.Da()?0:1);try{switch(r){case 0:i.wa=await n.onListen(s,!0);break;case 1:i.wa=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(o){const t=Da(o,`Initialization of query '${Wr(e.query)}' failed`);return void e.onError(t)}n.queries.set(s,i),i.Sa.push(e),e.va(n.onlineState),i.wa&&e.Fa(i.wa)&&Ua(n)}async function Va(t,e){const n=Ee(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const t=i.Sa.indexOf(e);t>=0&&(i.Sa.splice(t,1),0===i.Sa.length?s=e.Da()?0:1:!i.ba()&&e.Da()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function Pa(t,e){const n=Ee(t);let r=!1;for(const s of e){const t=s.query,e=n.queries.get(t);if(e){for(const t of e.Sa)t.Fa(s)&&(r=!0);e.wa=s}}r&&Ua(n)}function Fa(t,e,n){const r=Ee(t),s=r.queries.get(e);if(s)for(const i of s.Sa)i.onError(n);r.queries.delete(e)}function Ua(t){t.Ca.forEach(t=>{t.next()})}var Ba,qa;(qa=Ba||(Ba={})).Ma="default",qa.Cache="cache";class ja{constructor(t,e,n){this.query=t,this.xa=e,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=n||{}}Fa(t){if(!this.options.includeMetadataChanges){const e=[];for(const n of t.docChanges)3!==n.type&&e.push(n);t=new Ra(t.query,t.docs,t.oldDocs,e,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.Oa?this.Ba(t)&&(this.xa.next(t),e=!0):this.La(t,this.onlineState)&&(this.ka(t),e=!0),this.Na=t,e}onError(t){this.xa.error(t)}va(t){this.onlineState=t;let e=!1;return this.Na&&!this.Oa&&this.La(this.Na,t)&&(this.ka(this.Na),e=!0),e}La(t,e){if(!t.fromCache)return!0;if(!this.Da())return!0;const n="Offline"!==e;return(!this.options.qa||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||"Offline"===e)}Ba(t){if(t.docChanges.length>0)return!0;const e=this.Na&&this.Na.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&!0===this.options.includeMetadataChanges}ka(t){t=Ra.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.Oa=!0,this.xa.next(t)}Da(){return this.options.source!==Ba.Cache}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a{constructor(t){this.key=t}}class za{constructor(t){this.key=t}}class Ga{constructor(t,e){this.query=t,this.Ya=e,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=hs(),this.mutatedKeys=hs(),this.eu=Yr(t),this.tu=new Na(this.eu)}get nu(){return this.Ya}ru(t,e){const n=e?e.iu:new ka,r=e?e.tu:this.tu;let s=e?e.mutatedKeys:this.mutatedKeys,i=r,o=!1;const a="F"===this.query.limitType&&r.size===this.query.limit?r.last():null,c="L"===this.query.limitType&&r.size===this.query.limit?r.first():null;if(t.inorderTraversal((t,e)=>{const u=r.get(t),h=Xr(this.query,e)?e:null,l=!!u&&this.mutatedKeys.has(u.key),d=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations);let f=!1;u&&h?u.data.isEqual(h.data)?l!==d&&(n.track({type:3,doc:h}),f=!0):this.su(u,h)||(n.track({type:2,doc:h}),f=!0,(a&&this.eu(h,a)>0||c&&this.eu(h,c)<0)&&(o=!0)):!u&&h?(n.track({type:0,doc:h}),f=!0):u&&!h&&(n.track({type:1,doc:u}),f=!0,(a||c)&&(o=!0)),f&&(h?(i=i.add(h),s=d?s.add(t):s.delete(t)):(i=i.delete(t),s=s.delete(t)))}),null!==this.query.limit)for(;i.size>this.query.limit;){const t="F"===this.query.limitType?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),n.track({type:1,doc:t})}return{tu:i,iu:n,Cs:o,mutatedKeys:s}}su(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,r){const s=this.tu;this.tu=t.tu,this.mutatedKeys=t.mutatedKeys;const i=t.iu.ya();i.sort((t,e)=>function(t,e){const n=t=>{switch(t){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ve(20277,{Rt:t})}};return n(t)-n(e)}(t.type,e.type)||this.eu(t.doc,e.doc)),this.ou(n),r=r??!1;const o=e&&!r?this._u():[],a=0===this.Xa.size&&this.current&&!r?1:0,c=a!==this.Za;return this.Za=a,0!==i.length||c?{snapshot:new Ra(this.query,t.tu,s,i,t.mutatedKeys,0===a,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),au:o}:{au:o}}va(t){return this.current&&"Offline"===t?(this.current=!1,this.applyChanges({tu:this.tu,iu:new ka,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(t){return!this.Ya.has(t)&&!!this.tu.has(t)&&!this.tu.get(t).hasLocalMutations}ou(t){t&&(t.addedDocuments.forEach(t=>this.Ya=this.Ya.add(t)),t.modifiedDocuments.forEach(t=>{}),t.removedDocuments.forEach(t=>this.Ya=this.Ya.delete(t)),this.current=t.current)}_u(){if(!this.current)return[];const t=this.Xa;this.Xa=hs(),this.tu.forEach(t=>{this.uu(t.key)&&(this.Xa=this.Xa.add(t.key))});const e=[];return t.forEach(t=>{this.Xa.has(t)||e.push(new za(t))}),this.Xa.forEach(n=>{t.has(n)||e.push(new $a(n))}),e}cu(t){this.Ya=t.Qs,this.Xa=hs();const e=this.ru(t.documents);return this.applyChanges(e,!0)}lu(){return Ra.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,0===this.Za,this.hasCachedResults)}}const Ka="SyncEngine";class Ha{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class Qa{constructor(t){this.key=t,this.hu=!1}}class Wa{constructor(t,e,n,r,s,i){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Zr(t=>Qr(t),Hr),this.Iu=new Map,this.Eu=new Set,this.du=new En(Ke.comparator),this.Au=new Map,this.Ru=new oo,this.Vu={},this.mu=new Map,this.fu=Qi.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return!0===this.gu}}async function Xa(t,e,n=!0){const r=yc(t);let s;const i=r.Tu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await Ja(r,e,n,!0),s}async function Ya(t,e){const n=yc(t);await Ja(n,e,!0,!1)}async function Ja(t,e,n,r){const s=await function(t,e){const n=Ee(t);return n.persistence.runTransaction("Allocate target","readwrite",t=>{let r;return n.Pi.getTargetData(t,e).next(s=>s?(r=s,ln.resolve(r)):n.Pi.allocateTargetId(t).next(s=>(r=new Bi(e,s,"TargetPurposeListen",t.currentSequenceNumber),n.Pi.addTargetData(t,r).next(()=>r))))}).then(t=>{const r=n.Ms.get(t.targetId);return(null===r||t.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Ms=n.Ms.insert(t.targetId,t),n.xs.set(e,t.targetId)),t})}(t.localStore,zr(e)),i=s.targetId,o=t.sharedClientState.addLocalQueryTarget(i,n);let a;return r&&(a=await async function(t,e,n,r,s){t.pu=(e,n,r)=>async function(t,e,n,r){let s=e.view.ru(n);s.Cs&&(s=await Ao(t.localStore,e.query,!1).then(({documents:t})=>e.view.ru(t,s)));const i=r&&r.targetChanges.get(e.targetId),o=r&&null!=r.targetMismatches.get(e.targetId),a=e.view.applyChanges(s,t.isPrimaryClient,i,o);return lc(t,e.targetId,a.au),a.snapshot}(t,e,n,r);const i=await Ao(t.localStore,e,!0),o=new Ga(e,i.Qs),a=o.ru(i.documents),c=ni.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==t.onlineState,s),u=o.applyChanges(a,t.isPrimaryClient,c);lc(t,n,u.au);const h=new Ha(e,n,o);return t.Tu.set(e,h),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),u.snapshot}(t,e,i,"current"===o,s.resumeToken)),t.isPrimaryClient&&n&&ea(t.remoteStore,s),a}async function Za(t,e,n){const r=Ee(t),s=r.Tu.get(e),i=r.Iu.get(s.targetId);if(i.length>1)return r.Iu.set(s.targetId,i.filter(t=>!Hr(t,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Co(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&na(r.remoteStore,s.targetId),uc(r,s.targetId)}).catch(hn)):(uc(r,s.targetId),await Co(r.localStore,s.targetId,!0))}async function tc(t,e){const n=Ee(t),r=n.Tu.get(e),s=n.Iu.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),na(n.remoteStore,r.targetId))}async function ec(t,e,n){const r=function(t){const e=Ee(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ic.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=oc.bind(null,e),e}(t);try{const t=await function(t,e){const n=Ee(t),r=rn.now(),s=e.reduce((t,e)=>t.add(e.key),hs());let i,o;return n.persistence.runTransaction("Locally write mutations","readwrite",t=>{let a=es(),c=hs();return n.Ns.getEntries(t,s).next(t=>{a=t,a.forEach((t,e)=>{e.isValidDocument()||(c=c.add(t))})}).next(()=>n.localDocuments.getOverlayedDocuments(t,a)).next(s=>{i=s;const o=[];for(const t of e){const e=Ls(t,i.get(t.key).overlayedDocument);null!=e&&o.push(new Ps(t.key,e,lr(e.value.mapValue),Ds.exists(!0)))}return n.mutationQueue.addMutationBatch(t,r,o,e)}).next(e=>{o=e;const r=e.applyToLocalDocumentSet(i,c);return n.documentOverlayCache.saveOverlays(t,e.batchId,r)})}).then(()=>({batchId:o.batchId,changes:ss(i)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(t.batchId),function(t,e,n){let r=t.Vu[t.currentUser.toKey()];r||(r=new En(Me)),r=r.insert(e,n),t.Vu[t.currentUser.toKey()]=r}(r,t.batchId,n),await pc(r,t.changes),await ga(r.remoteStore)}catch(s){const t=Da(s,"Failed to persist write");n.reject(t)}}async function nc(t,e){const n=Ee(t);try{const t=await Io(n.localStore,e);e.targetChanges.forEach((t,e)=>{const r=n.Au.get(e);r&&(_e(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1,22616),t.addedDocuments.size>0?r.hu=!0:t.modifiedDocuments.size>0?_e(r.hu,14607):t.removedDocuments.size>0&&(_e(r.hu,42227),r.hu=!1))}),await pc(n,t,e)}catch(r){await hn(r)}}function rc(t,e,n){const r=Ee(t);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const t=[];r.Tu.forEach((n,r)=>{const s=r.view.va(e);s.snapshot&&t.push(s.snapshot)}),function(t,e){const n=Ee(t);n.onlineState=e;let r=!1;n.queries.forEach((t,n)=>{for(const s of n.Sa)s.va(e)&&(r=!0)}),r&&Ua(n)}(r.eventManager,e),t.length&&r.Pu.H_(t),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function sc(t,e,n){const r=Ee(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Au.get(e),i=s&&s.key;if(i){let t=new En(Ke.comparator);t=t.insert(i,dr.newNoDocument(i,sn.min()));const n=hs().add(i),s=new ei(sn.min(),new Map,new En(Me),t,n);await nc(r,s),r.du=r.du.remove(i),r.Au.delete(e),fc(r)}else await Co(r.localStore,e,!1).then(()=>uc(r,e,n)).catch(hn)}async function ic(t,e){const n=Ee(t),r=e.batch.batchId;try{const t=await function(t,e){const n=Ee(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",t=>{const r=e.batch.keys(),s=n.Ns.newChangeBuffer({trackRemovals:!0});return function(t,e,n,r){const s=n.batch,i=s.keys();let o=ln.resolve();return i.forEach(t=>{o=o.next(()=>r.getEntry(e,t)).next(e=>{const i=n.docVersions.get(t);_e(null!==i,48541),e.version.compareTo(i)<0&&(s.applyToRemoteDocument(e,n),e.isValidDocument()&&(e.setReadTime(n.commitVersion),r.addEntry(e)))})}),o.next(()=>t.mutationQueue.removeMutationBatch(e,s))}(n,t,e,s).next(()=>s.apply(t)).next(()=>n.mutationQueue.performConsistencyCheck(t)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(t,r,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t,function(t){let e=hs();for(let n=0;n<t.mutationResults.length;++n)t.mutationResults[n].transformResults.length>0&&(e=e.add(t.batch.mutations[n].key));return e}(e))).next(()=>n.localDocuments.getDocuments(t,r))})}(n.localStore,e);cc(n,r,null),ac(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await pc(n,t)}catch(s){await hn(s)}}async function oc(t,e,n){const r=Ee(t);try{const t=await function(t,e){const n=Ee(t);return n.persistence.runTransaction("Reject batch","readwrite-primary",t=>{let r;return n.mutationQueue.lookupMutationBatch(t,e).next(e=>(_e(null!==e,37113),r=e.keys(),n.mutationQueue.removeMutationBatch(t,e))).next(()=>n.mutationQueue.performConsistencyCheck(t)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(t,r,e)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t,r)).next(()=>n.localDocuments.getDocuments(t,r))})}(r.localStore,e);cc(r,e,n),ac(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await pc(r,t)}catch(s){await hn(s)}}function ac(t,e){(t.mu.get(e)||[]).forEach(t=>{t.resolve()}),t.mu.delete(e)}function cc(t,e,n){const r=Ee(t);let s=r.Vu[r.currentUser.toKey()];if(s){const t=s.get(e);t&&(n?t.reject(n):t.resolve(),s=s.remove(e)),r.Vu[r.currentUser.toKey()]=s}}function uc(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Iu.get(e))t.Tu.delete(r),n&&t.Pu.yu(r,n);t.Iu.delete(e),t.isPrimaryClient&&t.Ru.jr(e).forEach(e=>{t.Ru.containsKey(e)||hc(t,e)})}function hc(t,e){t.Eu.delete(e.path.canonicalString());const n=t.du.get(e);null!==n&&(na(t.remoteStore,n),t.du=t.du.remove(e),t.Au.delete(n),fc(t))}function lc(t,e,n){for(const r of n)r instanceof $a?(t.Ru.addReference(r.key,e),dc(t,r)):r instanceof za?(pe(Ka,"Document no longer in limbo: "+r.key),t.Ru.removeReference(r.key,e),t.Ru.containsKey(r.key)||hc(t,r.key)):ve(19791,{wu:r})}function dc(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Eu.has(r)||(pe(Ka,"New document in limbo: "+n),t.Eu.add(r),fc(t))}function fc(t){for(;t.Eu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Eu.values().next().value;t.Eu.delete(e);const n=new Ke($e.fromString(e)),r=t.fu.next();t.Au.set(r,new Qa(n)),t.du=t.du.insert(n,r),ea(t.remoteStore,new Bi(zr(Br(n.path)),r,"TargetPurposeLimboResolution",fn.ce))}}async function pc(t,e,n){const r=Ee(t),s=[],i=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((t,a)=>{o.push(r.pu(a,e,n).then(t=>{if((t||n)&&r.isPrimaryClient){const e=t?!t.fromCache:n?.targetChanges.get(a.targetId)?.current;r.sharedClientState.updateQueryState(a.targetId,e?"current":"not-current")}if(t){s.push(t);const e=yo.As(a.targetId,t);i.push(e)}}))}),await Promise.all(o),r.Pu.H_(s),await async function(t,e){const n=Ee(t);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",t=>ln.forEach(e,e=>ln.forEach(e.Es,r=>n.persistence.referenceDelegate.addReference(t,e.targetId,r)).next(()=>ln.forEach(e.ds,r=>n.persistence.referenceDelegate.removeReference(t,e.targetId,r)))))}catch(r){if(!dn(r))throw r;pe(_o,"Failed to update sequence numbers: "+r)}for(const s of e){const t=s.targetId;if(!s.fromCache){const e=n.Ms.get(t),r=e.snapshotVersion,s=e.withLastLimboFreeSnapshotVersion(r);n.Ms=n.Ms.insert(t,s)}}}(r.localStore,i))}async function gc(t,e){const n=Ee(t);if(!n.currentUser.isEqual(e)){pe(Ka,"User change. New user:",e.toKey());const t=await bo(n.localStore,e);n.currentUser=e,s="'waitForPendingWrites' promise is rejected due to a user change.",(r=n).mu.forEach(t=>{t.forEach(t=>{t.reject(new Te(be.CANCELLED,s))})}),r.mu.clear(),n.sharedClientState.handleUserChange(e,t.removedBatchIds,t.addedBatchIds),await pc(n,t.Ls)}var r,s}function mc(t,e){const n=Ee(t),r=n.Au.get(e);if(r&&r.hu)return hs().add(r.key);{let t=hs();const r=n.Iu.get(e);if(!r)return t;for(const e of r){const r=n.Tu.get(e);t=t.unionWith(r.view.nu)}return t}}function yc(t){const e=Ee(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=nc.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=mc.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=sc.bind(null,e),e.Pu.H_=Pa.bind(null,e.eventManager),e.Pu.yu=Fa.bind(null,e.eventManager),e}class vc{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=jo(t.databaseInfo.databaseId),this.sharedClientState=this.Du(t),this.persistence=this.Cu(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Fu(t,this.localStore),this.indexBackfillerScheduler=this.Mu(t,this.localStore)}Fu(t,e){return null}Mu(t,e){return null}vu(t){return function(t,e,n,r){return new Eo(t,e,n,r)}(this.persistence,new wo,t.initialUser,this.serializer)}Cu(t){return new fo(go.mi,this.serializer)}Du(t){return new No}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}vc.provider={build:()=>new vc};class wc extends vc{constructor(t){super(),this.cacheSizeBytes=t}Fu(t,e){_e(this.persistence.referenceDelegate instanceof mo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new Ji(n,t.asyncQueue,e)}Cu(t){const e=void 0!==this.cacheSizeBytes?Hi.withCacheSize(this.cacheSizeBytes):Hi.DEFAULT;return new fo(t=>mo.mi(t,e),this.serializer)}}class _c{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=t=>rc(this.syncEngine,t,1),this.remoteStore.remoteSyncer.handleCredentialChange=gc.bind(null,this.syncEngine),await async function(t,e){const n=Ee(t);e?(n.Ea.delete(2),await Zo(n)):e||(n.Ea.add(2),await ta(n),n.Ra.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return new Oa}createDatastore(t){const e=jo(t.databaseInfo.databaseId),n=(r=t.databaseInfo,new Bo(r));var r;return function(t,e,n,r){return new Wo(t,e,n,r)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return e=this.localStore,n=this.datastore,r=t.asyncQueue,s=t=>rc(this.syncEngine,t,0),i=xo.v()?new xo:new ko,new Jo(e,n,r,s,i);var e,n,r,s,i}createSyncEngine(t,e){return function(t,e,n,r,s,i,o){const a=new Wa(t,e,n,r,s,i);return o&&(a.gu=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){await async function(t){const e=Ee(t);pe(Yo,"RemoteStore shutting down."),e.Ea.add(5),await ta(e),e.Aa.shutdown(),e.Ra.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}_c.provider={build:()=>new _c};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ec{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ou(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ou(this.observer.error,t):ge("Uncaught Error in snapshot listener:",t.toString()))}Nu(){this.muted=!0}Ou(t,e){setTimeout(()=>{this.muted||t(e)},0)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc="FirestoreClient";class Tc{constructor(t,e,n,r,s){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=r,this.user=he.UNAUTHENTICATED,this.clientId=Le.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async t=>{pe(bc,"Received user=",t.uid),await this.authCredentialListener(t),this.user=t}),this.appCheckCredentials.start(n,t=>(pe(bc,"Received new app check token=",t),this.appCheckCredentialListener(t,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Ie;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Da(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function Ic(t,e){t.asyncQueue.verifyOperationInProgress(),pe(bc,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async t=>{r.isEqual(t)||(await bo(e.localStore,t),r=t)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Sc(t,e){t.asyncQueue.verifyOperationInProgress();const n=await async function(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){pe(bc,"Using user provided OfflineComponentProvider");try{await Ic(t,t._uninitializedComponentsProvider._offline)}catch(e){const s=e;if(!("FirebaseError"===(n=s).name?n.code===be.FAILED_PRECONDITION||n.code===be.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&n instanceof DOMException)||22===n.code||20===n.code||11===n.code))throw s;me("Error using user provided cache. Falling back to memory cache: "+s),await Ic(t,new vc)}}else pe(bc,"Using default OfflineComponentProvider"),await Ic(t,new wc(void 0));var n;return t._offlineComponents}(t);pe(bc,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(t=>Ia(e.remoteStore,t)),t.setAppCheckTokenChangeListener((t,n)=>Ia(e.remoteStore,n)),t._onlineComponents=e}async function Cc(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(pe(bc,"Using user provided OnlineComponentProvider"),await Sc(t,t._uninitializedComponentsProvider._online)):(pe(bc,"Using default OnlineComponentProvider"),await Sc(t,new _c))),t._onlineComponents}async function Ac(t){const e=await Cc(t),n=e.eventManager;return n.onListen=Xa.bind(null,e.syncEngine),n.onUnlisten=Za.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=Ya.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=tc.bind(null,e.syncEngine),n}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Dc(t){const e={};return void 0!==t.timeoutSeconds&&(e.timeoutSeconds=t.timeoutSeconds),e
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Nc=new Map,kc="firestore.googleapis.com",Rc=!0;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xc{constructor(t){if(void 0===t.host){if(void 0!==t.ssl)throw new Te(be.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=kc,this.ssl=Rc}else this.host=t.host,this.ssl=t.ssl??Rc;if(this.isUsingEmulator=void 0!==t.emulatorOptions,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,void 0===t.cacheSizeBytes)this.cacheSizeBytes=Ki;else{if(-1!==t.cacheSizeBytes&&t.cacheSizeBytes<1048576)throw new Te(be.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}(function(t,e,n,r){if(!0===e&&!0===r)throw new Te(be.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)})("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===t.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Dc(t.experimentalLongPollingOptions??{}),function(t){if(void 0!==t.timeoutSeconds){if(isNaN(t.timeoutSeconds))throw new Te(be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (must not be NaN)`);if(t.timeoutSeconds<5)throw new Te(be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (minimum allowed value is 5)`);if(t.timeoutSeconds>30)throw new Te(be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&(e=this.experimentalLongPollingOptions,n=t.experimentalLongPollingOptions,e.timeoutSeconds===n.timeoutSeconds)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams;var e,n}}class Oc{constructor(t,e,n,r){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new xc({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Te(be.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(t){if(this._settingsFrozen)throw new Te(be.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new xc(t),this._emulatorOptions=t.emulatorOptions||{},void 0!==t.credentials&&(this._authCredentials=function(t){if(!t)return new Ce;switch(t.type){case"firstParty":return new ke(t.sessionIndex||"0",t.iamToken||null,t.authTokenFactory||null);case"provider":return t.client;default:throw new Te(be.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const e=Nc.get(t);e&&(pe("ComponentProvider","Removing Datastore"),Nc.delete(t),e.terminate())}(this),Promise.resolve()}}function Lc(t,e,n,r={}){t=Je(t,Oc);const i=l(e),o=t._getSettings(),a={...o,emulatorOptions:t._getEmulatorOptions()},c=`${e}:${n}`;i&&(d(`https://${c}`),g("Firestore",!0)),o.host!==kc&&o.host!==c&&me("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...o,host:c,ssl:i,emulatorOptions:r};if(!_(u,a)&&(t._setSettings(u),r.mockUserToken)){let e,n;if("string"==typeof r.mockUserToken)e=r.mockUserToken,n=he.MOCK_USER;else{e=function(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=e||"demo-project",r=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...t};return[s(JSON.stringify({alg:"none",type:"JWT"})),s(JSON.stringify(o)),""].join(".")}(r.mockUserToken,t._app?.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new Te(be.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new he(i)}t._authCredentials=new Ae(new Se(e,n))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new Mc(this.firestore,t,this._query)}}class Vc{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Pc(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new Vc(this.firestore,t,this._key)}toJSON(){return{type:Vc._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,n){if(tn(e,Vc._jsonSchema))return new Vc(t,n||null,new Ke($e.fromString(e.referencePath)))}}Vc._jsonSchemaVersion="firestore/documentReference/1.0",Vc._jsonSchema={type:Ze("string",Vc._jsonSchemaVersion),referencePath:Ze("string")};class Pc extends Mc{constructor(t,e,n){super(t,e,Br(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new Vc(this.firestore,null,new Ke(t))}withConverter(t){return new Pc(this.firestore,t,this._path)}}function Fc(t,e,...n){if(t=b(t),He("collection","path",e),t instanceof Oc){const r=$e.fromString(e,...n);return We(r),new Pc(t,null,r)}{if(!(t instanceof Vc||t instanceof Pc))throw new Te(be.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child($e.fromString(e,...n));return We(r),new Pc(t.firestore,null,r)}}function Uc(t,e,...n){if(t=b(t),1===arguments.length&&(e=Le.newId()),He("doc","path",e),t instanceof Oc){const r=$e.fromString(e,...n);return Qe(r),new Vc(t,null,new Ke(r))}{if(!(t instanceof Vc||t instanceof Pc))throw new Te(be.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child($e.fromString(e,...n));return Qe(r),new Vc(t.firestore,t instanceof Pc?t.converter:null,new Ke(r))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bc="AsyncQueue";class qc{constructor(t=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new $o(this,"async_queue_retry"),this._c=()=>{const t=qo();t&&pe(Bc,"Visibility state changed to "+t.visibilityState),this.M_.w_()},this.ac=t;const e=qo();e&&"function"==typeof e.addEventListener&&e.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.uc(),this.cc(t)}enterRestrictedMode(t){if(!this.ec){this.ec=!0,this.sc=t||!1;const e=qo();e&&"function"==typeof e.removeEventListener&&e.removeEventListener("visibilitychange",this._c)}}enqueue(t){if(this.uc(),this.ec)return new Promise(()=>{});const e=new Ie;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Xu.push(t),this.lc()))}async lc(){if(0!==this.Xu.length){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(t){if(!dn(t))throw t;pe(Bc,"Operation failed with retryable error: "+t)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(t){const e=this.ac.then(()=>(this.rc=!0,t().catch(t=>{throw this.nc=t,this.rc=!1,ge("INTERNAL UNHANDLED ERROR: ",jc(t)),t}).then(t=>(this.rc=!1,t))));return this.ac=e,e}enqueueAfterDelay(t,e,n){this.uc(),this.oc.indexOf(t)>-1&&(e=0);const r=Aa.createAndSchedule(this,t,e,n,t=>this.hc(t));return this.tc.push(r),r}uc(){this.nc&&ve(47125,{Pc:jc(this.nc)})}verifyOperationInProgress(){}async Tc(){let t;do{t=this.ac,await t}while(t!==this.ac)}Ic(t){for(const e of this.tc)if(e.timerId===t)return!0;return!1}Ec(t){return this.Tc().then(()=>{this.tc.sort((t,e)=>t.targetTimeMs-e.targetTimeMs);for(const e of this.tc)if(e.skipDelay(),"all"!==t&&e.timerId===t)break;return this.Tc()})}dc(t){this.oc.push(t)}hc(t){const e=this.tc.indexOf(t);this.tc.splice(e,1)}}function jc(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+"\n"+t.stack),e
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}function $c(t){return function(t,e){if("object"!=typeof t||null===t)return!1;const n=t;for(const r of e)if(r in n&&"function"==typeof n[r])return!0;return!1}(t,["next","error","complete"])}class zc extends Oc{constructor(t,e,n,r){super(t,e,n,r),this.type="firestore",this._queue=new qc,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new qc(t),this._firestoreClient=void 0,await t}}}function Gc(t,e){const n="object"==typeof t?t:Ft(),r="string"==typeof t?t:qn,s=Ot(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const t=c("firestore");t&&Lc(s,...t)}return s}function Kc(t){if(t._terminated)throw new Te(be.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||function(t){const e=t._freezeSettings(),n=(r=t._databaseId,s=t._app?.options.appId||"",i=t._persistenceKey,o=e,new Bn(r,s,i,o.host,o.ssl,o.experimentalForceLongPolling,o.experimentalAutoDetectLongPolling,Dc(o.experimentalLongPollingOptions),o.useFetchStreams,o.isUsingEmulator));var r,s,i,o;t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new Tc(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(t){const e=t?._online.build();return{_offline:t?._offline.build(e),_online:e}}(t._componentsProvider))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t),t._firestoreClient}class Hc{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Hc(Dn.fromBase64String(t))}catch(e){throw new Te(be.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Hc(Dn.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Hc._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(tn(t,Hc._jsonSchema))return Hc.fromBase64String(t.bytes)}}Hc._jsonSchemaVersion="firestore/bytes/1.0",Hc._jsonSchema={type:Ze("string",Hc._jsonSchemaVersion),bytes:Ze("string")};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qc{constructor(...t){for(let e=0;e<t.length;++e)if(0===t[e].length)throw new Te(be.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ge(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wc{constructor(t){this._methodName=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xc{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new Te(be.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new Te(be.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return Me(this._lat,t._lat)||Me(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Xc._jsonSchemaVersion}}static fromJSON(t){if(tn(t,Xc._jsonSchema))return new Xc(t.latitude,t.longitude)}}Xc._jsonSchemaVersion="firestore/geoPoint/1.0",Xc._jsonSchema={type:Ze("string",Xc._jsonSchemaVersion),latitude:Ze("number"),longitude:Ze("number")};
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Yc{constructor(t){this._values=(t||[]).map(t=>t)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(t,e){if(t.length!==e.length)return!1;for(let n=0;n<t.length;++n)if(t[n]!==e[n])return!1;return!0}(this._values,t._values)}toJSON(){return{type:Yc._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(tn(t,Yc._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(t=>"number"==typeof t))return new Yc(t.vectorValues);throw new Te(be.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Yc._jsonSchemaVersion="firestore/vectorValue/1.0",Yc._jsonSchema={type:Ze("string",Yc._jsonSchemaVersion),vectorValues:Ze("object")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Jc=/^__.*__$/;function Zc(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ve(40011,{Ac:t})}}class tu{constructor(t,e,n,r,s,i){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.Rc(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(t){return new tu({...this.settings,...t},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(t){const e=this.path?.child(t),n=this.Vc({path:e,fc:!1});return n.gc(t),n}yc(t){const e=this.path?.child(t),n=this.Vc({path:e,fc:!1});return n.Rc(),n}wc(t){return this.Vc({path:void 0,fc:!0})}Sc(t){return au(t,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(t){return void 0!==this.fieldMask.find(e=>t.isPrefixOf(e))||void 0!==this.fieldTransforms.find(e=>t.isPrefixOf(e.field))}Rc(){if(this.path)for(let t=0;t<this.path.length;t++)this.gc(this.path.get(t))}gc(t){if(0===t.length)throw this.Sc("Document fields must not be empty");if(Zc(this.Ac)&&Jc.test(t))throw this.Sc('Document fields cannot begin and end with "__"')}}class eu{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||jo(t)}Cc(t,e,n,r=!1){return new tu({Ac:t,methodName:e,Dc:n,path:Ge.emptyPath(),fc:!1,bc:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nu(t){const e=t._freezeSettings(),n=jo(t._databaseId);return new eu(t._databaseId,!!e.ignoreUndefinedProperties,n)}function ru(t,e,n,r=!1){return su(n,t.Cc(r?4:3,e))}function su(t,e){if(iu(t=b(t)))return function(t,e,n){if(!iu(n)||!Xe(n)){const r=Ye(n);throw"an object"===r?e.Sc(t+" a custom object"):e.Sc(t+" "+r)}}("Unsupported field value:",e,t),function(t,e){const n={};return _n(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):wn(t,(t,r)=>{const s=su(r,e.mc(t));null!=s&&(n[t]=s)}),{mapValue:{fields:n}}}(t,e);if(t instanceof Wc)return function(t,e){if(!Zc(e.Ac))throw e.Sc(`${t._methodName}() can only be used with update() and set()`);if(!e.path)throw e.Sc(`${t._methodName}() is not currently supported inside arrays`);const n=t._toFieldTransform(e);n&&e.fieldTransforms.push(n)}(t,e),null;if(void 0===t&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.fc&&4!==e.Ac)throw e.Sc("Nested arrays are not supported");return function(t,e){const n=[];let r=0;for(const s of t){let t=su(s,e.wc(r));null==t&&(t={nullValue:"NULL_VALUE"}),n.push(t),r++}return{arrayValue:{values:n}}}(t,e)}return function(t,e){if(null===(t=b(t)))return{nullValue:"NULL_VALUE"};if("number"==typeof t)return ps(e.serializer,t);if("boolean"==typeof t)return{booleanValue:t};if("string"==typeof t)return{stringValue:t};if(t instanceof Date){const n=rn.fromDate(t);return{timestampValue:gi(e.serializer,n)}}if(t instanceof rn){const n=new rn(t.seconds,1e3*Math.floor(t.nanoseconds/1e3));return{timestampValue:gi(e.serializer,n)}}if(t instanceof Xc)return{geoPointValue:{latitude:t.latitude,longitude:t.longitude}};if(t instanceof Hc)return{bytesValue:mi(e.serializer,t._byteString)};if(t instanceof Vc){const n=e.databaseId,r=t.firestore._databaseId;if(!r.isEqual(n))throw e.Sc(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:wi(t.firestore._databaseId||e.databaseId,t._key.path)}}if(t instanceof Yc)return n=t,r=e,{mapValue:{fields:{[$n]:{stringValue:Kn},[Hn]:{arrayValue:{values:n.toArray().map(t=>{if("number"!=typeof t)throw r.Sc("VectorValues must only contain numeric values.");return ds(r.serializer,t)})}}}}};var n,r;throw e.Sc(`Unsupported field value: ${Ye(t)}`)}(t,e)}function iu(t){return!("object"!=typeof t||null===t||t instanceof Array||t instanceof Date||t instanceof rn||t instanceof Xc||t instanceof Hc||t instanceof Vc||t instanceof Wc||t instanceof Yc)}const ou=new RegExp("[~\\*/\\[\\]]");function au(t,e,n,r,s){const i=r&&!r.isEmpty(),o=void 0!==s;let a=`Function ${e}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new Te(be.INVALID_ARGUMENT,a+t+c)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class cu{constructor(t,e,n,r,s){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Vc(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const t=new uu(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(hu("DocumentSnapshot.get",t));if(null!==e)return this._userDataWriter.convertValue(e)}}}class uu extends cu{data(){return super.data()}}function hu(t,e){return"string"==typeof e?function(t,e,n){if(e.search(ou)>=0)throw au(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Qc(...e.split("."))._internalPath}catch(r){throw au(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}(t,e):e instanceof Qc?e._internalPath:e._delegate._internalPath}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lu(t){if("L"===t.limitType&&0===t.explicitOrderBy.length)throw new Te(be.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class du{}class fu extends du{}function pu(t,e,...n){let r=[];e instanceof du&&r.push(e),r=r.concat(n),function(t){const e=t.filter(t=>t instanceof yu).length,n=t.filter(t=>t instanceof gu).length;if(e>1||e>0&&n>0)throw new Te(be.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class gu extends fu{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new gu(t,e,n)}_apply(t){const e=this._parse(t);return Cu(t._query,e),new Mc(t.firestore,t.converter,Gr(t._query,e))}_parse(t){const e=nu(t.firestore);return function(t,e,n,r,s,i,o){let a;if(s.isKeyField()){if("array-contains"===i||"array-contains-any"===i)throw new Te(be.INVALID_ARGUMENT,`Invalid Query. You can't perform '${i}' queries on documentId().`);if("in"===i||"not-in"===i){Su(o,i);const e=[];for(const n of o)e.push(Iu(r,t,n));a={arrayValue:{values:e}}}else a=Iu(r,t,o)}else"in"!==i&&"not-in"!==i&&"array-contains-any"!==i||Su(o,i),a=ru(n,e,o,"in"===i||"not-in"===i);return wr.create(s,i,a)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function mu(t,e,n){const r=e,s=hu("where",t);return gu._create(s,r,n)}class yu extends du{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new yu(t,e)}_parse(t){const e=this._queryConstraints.map(e=>e._parse(t)).filter(t=>t.getFilters().length>0);return 1===e.length?e[0]:_r.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return 0===e.getFilters().length?t:(function(t,e){let n=t;const r=e.getFlattenedFilters();for(const s of r)Cu(n,s),n=Gr(n,s)}(t._query,e),new Mc(t.firestore,t.converter,Gr(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class vu extends fu{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new vu(t,e)}_apply(t){const e=function(t,e,n){if(null!==t.startAt)throw new Te(be.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==t.endAt)throw new Te(be.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new mr(e,n)}(t._query,this._field,this._direction);return new Mc(t.firestore,t.converter,function(t,e){const n=t.explicitOrderBy.concat([e]);return new Ur(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}(t._query,e))}}function wu(t,e="asc"){const n=e,r=hu("orderBy",t);return vu._create(r,n)}class _u extends fu{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new _u(t,e,n)}_apply(t){return new Mc(t.firestore,t.converter,Kr(t._query,this._limit,this._limitType))}}function Eu(t){return function(t,e){if(e<=0)throw new Te(be.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}("limit",t),_u._create("limit",t,"F")}class bu extends fu{constructor(t,e,n){super(),this.type=t,this._docOrFields=e,this._inclusive=n}static _create(t,e,n){return new bu(t,e,n)}_apply(t){const e=function(t,e,n,r){if(n[0]=b(n[0]),n[0]instanceof cu)return function(t,e,n,r,s){if(!r)throw new Te(be.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${n}().`);const i=[];for(const o of $r(t))if(o.field.isKeyField())i.push(rr(e,r.key));else{const t=r.data.field(o.field);if(Pn(t))throw new Te(be.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+o.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(null===t){const t=o.field.canonicalString();throw new Te(be.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${t}' (used as the orderBy) does not exist.`)}i.push(t)}return new fr(i,s)}(t._query,t.firestore._databaseId,e,n[0]._document,r);{const s=nu(t.firestore);return function(t,e,n,r,s,i){const o=t.explicitOrderBy;if(s.length>o.length)throw new Te(be.INVALID_ARGUMENT,`Too many arguments provided to ${r}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const a=[];for(let c=0;c<s.length;c++){const i=s[c];if(o[c].field.isKeyField()){if("string"!=typeof i)throw new Te(be.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${r}(), but got a ${typeof i}`);if(!jr(t)&&-1!==i.indexOf("/"))throw new Te(be.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${r}() must be a plain document ID, but '${i}' contains a slash.`);const n=t.path.child($e.fromString(i));if(!Ke.isDocumentKey(n))throw new Te(be.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${r}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);const s=new Ke(n);a.push(rr(e,s))}else{const t=ru(n,r,i);a.push(t)}}return new fr(a,i)}(t._query,t.firestore._databaseId,s,e,n,r)}}(t,this.type,this._docOrFields,this._inclusive);return new Mc(t.firestore,t.converter,(n=t._query,r=e,new Ur(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),n.limit,n.limitType,r,n.endAt)));var n,r}}function Tu(...t){return bu._create("startAfter",t,!1)}function Iu(t,e,n){if("string"==typeof(n=b(n))){if(""===n)throw new Te(be.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!jr(e)&&-1!==n.indexOf("/"))throw new Te(be.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child($e.fromString(n));if(!Ke.isDocumentKey(r))throw new Te(be.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return rr(t,new Ke(r))}if(n instanceof Vc)return rr(t,n._key);throw new Te(be.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ye(n)}.`)}function Su(t,e){if(!Array.isArray(t)||0===t.length)throw new Te(be.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Cu(t,e){const n=function(t,e){for(const n of t)for(const t of n.getFlattenedFilters())if(e.indexOf(t.op)>=0)return t.op;return null}(t.filters,function(t){switch(t){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(null!==n)throw n===e.op?new Te(be.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new Te(be.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class Au{convertValue(t,e="none"){switch(Qn(t)){case 0:return null;case 1:return t.booleanValue;case 2:return Rn(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(xn(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw ve(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return wn(t,(t,r)=>{n[t]=this.convertValue(r,e)}),n}convertVectorValue(t){const e=t.fields?.[Hn].arrayValue?.values?.map(t=>Rn(t.doubleValue));return new Yc(e)}convertGeoPoint(t){return new Xc(Rn(t.latitude),Rn(t.longitude))}convertArray(t,e){return(t.values||[]).map(t=>this.convertValue(t,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=Fn(t);return null==n?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(Un(t));default:return null}}convertTimestamp(t){const e=kn(t);return new rn(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=$e.fromString(t);_e(Ui(n),9688,{name:t});const r=new jn(n.get(1),n.get(3)),s=new Ke(n.popFirst(5));return r.isEqual(e)||ge(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),s}}class Du{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Nu extends cu{constructor(t,e,n,r,s,i){super(t,e,n,r,i),this._firestore=t,this._firestoreImpl=t,this.metadata=s}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new ku(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(hu("DocumentSnapshot.get",t));if(null!==n)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new Te(be.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=Nu._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),t&&t.isValidDocument()&&t.isFoundDocument()?(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e):e}}Nu._jsonSchemaVersion="firestore/documentSnapshot/1.0",Nu._jsonSchema={type:Ze("string",Nu._jsonSchemaVersion),bundleSource:Ze("string","DocumentSnapshot"),bundleName:Ze("string"),bundle:Ze("string")};class ku extends Nu{data(t={}){return super.data(t)}}class Ru{constructor(t,e,n,r){this._firestore=t,this._userDataWriter=e,this._snapshot=r,this.metadata=new Du(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new ku(this._firestore,this._userDataWriter,n.key,n,new Du(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new Te(be.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(t,e){if(t._snapshot.oldDocs.isEmpty()){let e=0;return t._snapshot.docChanges.map(n=>{const r=new ku(t._firestore,t._userDataWriter,n.doc.key,n.doc,new Du(t._snapshot.mutatedKeys.has(n.doc.key),t._snapshot.fromCache),t.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:e++}})}{let n=t._snapshot.oldDocs;return t._snapshot.docChanges.filter(t=>e||3!==t.type).map(e=>{const r=new ku(t._firestore,t._userDataWriter,e.doc.key,e.doc,new Du(t._snapshot.mutatedKeys.has(e.doc.key),t._snapshot.fromCache),t.query.converter);let s=-1,i=-1;return 0!==e.type&&(s=n.indexOf(e.doc.key),n=n.delete(e.doc.key)),1!==e.type&&(n=n.add(e.doc),i=n.indexOf(e.doc.key)),{type:xu(e.type),doc:r,oldIndex:s,newIndex:i}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new Te(be.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=Ru._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Le.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],n=[],r=[];return this.docs.forEach(t=>{null!==t._document&&(e.push(t._document),n.push(this._userDataWriter.convertObjectMap(t._document.data.value.mapValue.fields,"previous")),r.push(t.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function xu(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ve(61501,{type:t})}}Ru._jsonSchemaVersion="firestore/querySnapshot/1.0",Ru._jsonSchema={type:Ze("string",Ru._jsonSchemaVersion),bundleSource:Ze("string","QuerySnapshot"),bundleName:Ze("string"),bundle:Ze("string")};class Ou extends Au{constructor(t){super(),this.firestore=t}convertBytes(t){return new Hc(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new Vc(this.firestore,null,e)}}function Lu(t){t=Je(t,Mc);const e=Je(t.firestore,zc),n=Kc(e),r=new Ou(e);return lu(t._query),function(t,e,n={}){const r=new Ie;return t.asyncQueue.enqueueAndForget(async()=>function(t,e,n,r,s){const i=new Ec({next:n=>{i.Nu(),e.enqueueAndForget(()=>Va(t,o)),n.fromCache&&"server"===r.source?s.reject(new Te(be.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(n)},error:t=>s.reject(t)}),o=new ja(n,i,{includeMetadataChanges:!0,qa:!0});return Ma(t,o)}(await Ac(t),t.asyncQueue,e,n,r)),r.promise}(n,t._query).then(n=>new Ru(e,r,t,n))}function Mu(t){return function(t,e){return function(t,e){const n=new Ie;return t.asyncQueue.enqueueAndForget(async()=>ec(await function(t){return Cc(t).then(t=>t.syncEngine)}(t),e,n)),n.promise}(Kc(t),e)}(Je(t.firestore,zc),[new qs(t._key,Ds.none())])}function Vu(t,...e){t=b(t);let n={includeMetadataChanges:!1,source:"default"},r=0;"object"!=typeof e[r]||$c(e[r])||(n=e[r++]);const s={includeMetadataChanges:n.includeMetadataChanges,source:n.source};if($c(e[r])){const t=e[r];e[r]=t.next?.bind(t),e[r+1]=t.error?.bind(t),e[r+2]=t.complete?.bind(t)}let i,o,a;if(t instanceof Vc)o=Je(t.firestore,zc),a=Br(t._key.path),i={next:n=>{e[r]&&e[r](function(t,e,n){const r=n.docs.get(e._key),s=new Ou(t);return new Nu(t,s,e._key,r,new Du(n.hasPendingWrites,n.fromCache),e.converter)}(o,t,n))},error:e[r+1],complete:e[r+2]};else{const n=Je(t,Mc);o=Je(n.firestore,zc),a=n._query;const s=new Ou(o);i={next:t=>{e[r]&&e[r](new Ru(o,s,n,t))},error:e[r+1],complete:e[r+2]},lu(t._query)}return function(t,e,n,r){const s=new Ec(r),i=new ja(e,s,n);return t.asyncQueue.enqueueAndForget(async()=>Ma(await Ac(t),i)),()=>{s.Nu(),t.asyncQueue.enqueueAndForget(async()=>Va(await Ac(t),i))}}(Kc(o),a,s,i)}!function(t,e=!0){le="12.4.0",xt(new T("firestore",(t,{instanceIdentifier:n,options:r})=>{const s=t.getProvider("app").getImmediate(),i=new zc(new De(t.getProvider("auth-internal")),new xe(s,t.getProvider("app-check-internal")),function(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new Te(be.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new jn(t.options.projectId,e)}(s,n),s);return r={useFetchStreams:e,...r},i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),Ut(ce,ue,t),Ut(ce,ue,"esm2020")}();
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Ut("firebase","12.4.0","app");export{T as C,xt as _,Lt as a,Ot as b,b as c,c as d,Pt as e,Gc as f,Ft as g,Fc as h,l as i,Mu as j,Uc as k,wu as l,Eu as m,Lu as n,Vu as o,d as p,pu as q,Ut as r,Tu as s,g as u,mu as w};
