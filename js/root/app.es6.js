import $ from './../lib/jquery-1.11.2.min';
import ModuleLoader from './../sharedModules/ModuleLoader.es6';
import Utils from './../sharedModules/Utils.es6';
import Sample from './modules/Sample.es6';


let app = new ModuleLoader($, Utils, [
	Sample
], $('[data-module]'));

app.init();

//FOR DEBUGGING
window._app = app;
