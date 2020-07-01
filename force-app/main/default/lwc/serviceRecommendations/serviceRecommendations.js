/* eslint-disable no-console */
import { LightningElement, track, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import mapModal from '@salesforce/resourceUrl/mapModal';
import { subscribe, unsubscribe } from 'lightning/empApi';

import getRecommendations from '@salesforce/apex/getRecommendations.getRecommendations';

const eventChannel = '/event/Client_Profile_Update_Notification__e';

export default class ServiceRecommendations extends LightningElement {
  subscription = {};

  @track returnRecommendations;
  @track returnHiddenRecommendations;
  @api recordId;
  @api typefilters;
  @track serviceId;

  @track showRecommendations = false;
  @track showRelevancePopover = false;
  @track showDropdown = false;
  @track showAddComment = false;
  @track showExpandedMap = false;
  @track showHiddenRecsList = false;

  @track showHoursFilterChangePopover = false;
  @track showLocationFilterChangePopover = false;

  get locationFilterOperatorOptions() {
    return [
      { label: 'Within', value: 'Within' },
      { label: 'In Progress', value: 'inProgress' },
      { label: 'Finished', value: 'finished' }
    ];
    }
   connectedCallback(){

        Promise.all([
            loadStyle(this, mapModal)
        ])
    }

    handleRequestRecommendations(){
        console.log('getting recommendations');
        console.log('recorid Id'+ this.recordId)
        getRecommendations({contactId: this.recordId })
            .then((result) => {
                window.console.log('success');
                if(this.showRecommendations === false){
                    this.showRecommendations = !this.showRecommendations;
                }
                window.console.log('result' + JSON.stringify(result));
                this.returnRecommendations = result;
            })
            .catch((error) => {
                window.console.log('error:' + error);
            });
    }

    handleExpand(){
        this.showExpandedMap = !this.showExpandedMap;
    }

    handleFilterList(){
        window.console.log('show filter window'+ this.template.querySelector('.mapModalDiv').classList);
        
        this.template.querySelector('.mapModalDiv').classList.toggle('width67');
        this.template.querySelector('.mapModalDiv').classList.toggle('mapDivNarrow');
        this.template.querySelector('.recommendationsDiv').classList.toggle('recommendationsDivWide');
        //this.template.querySelector('.innerRecModalDiv').classList.toggle('modalWidth100');
        this.template.querySelector('.recommendationsDiv').classList.toggle('recommendationsDivNarrow');
        this.template.querySelector('.filterDiv').classList.toggle('slds-hide');
  }

  mapMarkers = [
    {
      location: {
        Street: '415 Mission St',
        City: 'San Francisco',
        State: 'CA'
      },

      title: 'Salesforce Tower',
      description: 'lorem ipsum'

    }
  ];

  handleCloseFilters() {
    window.console.log('close filters');
    this.template.querySelector('.mapModalDiv').classList.toggle('width67');
    this.template
      .querySelector('.mapModalDiv')
      .classList.toggle('mapDivNarrow');
    //this.template.querySelector('.innerRecModalDiv').classList.toggle('modalWidth100');
    this.template
      .querySelector('.recommendationsDiv')
      .classList.toggle('recommendationsDivWide');
    this.template
      .querySelector('.recommendationsDiv')
      .classList.toggle('recommendationsDivNarrow');
    this.template.querySelector('.filterDiv').classList.toggle('slds-hide');
  }

  handleSortList() {}

  handleShowHidden() {
    this.showHiddenRecsList = !this.showHiddenRecsList;
  }

  changeFilter(event) {
    window.console.log(event);
    let tgt = event.currentTarget;
    let filterAttribute = tgt.getAttribute('data-filter');
    window.console.log(filterAttribute);
    if (filterAttribute === 'openhours') {
      this.showHoursFilterChangePopover = !this.showHoursFilterChangePopover;
    }
    if (filterAttribute === 'location') {
      this.showLocationFilterChangePopover = !this
        .showLocationFilterChangePopover;
    }
  }

  removeFilter() {}

  handleSortMenu(event) {
    window.console.log('show sort menu');
    const menuItem = event.currentTarget;
    const parent = menuItem.parentElement;
    window.console.log('children' + parent.children);
    for (let sibling of parent.children) {
      sibling.checked = false;
    }
    menuItem.checked = !menuItem.checked;
    //run sorting
  }

  handleUpdateTypeFilters(event) {
    window.console.log('type filters' + event.typefilters);
  }

  handleSubscribe() {
    const context = this;
    const messageCallback = function (response) {
      // console.log(JSON.stringify(response));
      // console.log(context.recordId);
      if (response.data.payload.ContactId__c === context.recordId) {
        context.handleRequestRecommendations();
      }
    };
    subscribe(eventChannel, -1, messageCallback).then((response) => {
      // Response contains the subscription information on subscribe call
      // console.log(
      //   'Subscription request sent to: ',
      //   JSON.stringify(response.channel)
      // );
      this.subscription = response;
    });
  }

  renderedCallback() {
    this.handleSubscribe();
  }

  disconnectedCallback() {
    unsubscribe(this.subscription, (response) => {
      console.log('unsubscribe() response: ', JSON.stringify(response));
      // Response is true for successful unsubscribe
    });
  }
}