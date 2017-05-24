import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import sortBy from 'lodash-es/sortBy';

import { StaffingResource, State, PhoneNumber, Address, AddressType, PhoneNumberType } from '../core/entities/entity-model';
import { ResourceMgtUnitOfWork } from './resource-mgt-unit-of-work';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/publishReplay';

@Component({
    selector: 'resource-contacts',
    moduleId: module.id,
    templateUrl: './resource-contacts.html'
})
export class ResourceContactsComponent implements OnInit, OnDestroy {

    @Input() model: StaffingResource;

    states: Observable<State[]>;
    addressTypes: AddressType[];
    phoneNumberTypes: PhoneNumberType[];

    private onDestroy = new Subject<any>();

    constructor(private unitOfWork: ResourceMgtUnitOfWork) { }

    ngOnInit() {
        let states = Observable.merge(
            Observable.defer(() => Observable.of(this.unitOfWork.getEntities<State>('State'))),
            this.unitOfWork.entityChanged
                .filter(x => x.entity instanceof State)
                .map(() => this.unitOfWork.getEntities<State>('State'))
        ).takeUntil(this.onDestroy).publishReplay(1);
        this.states = states;
        this.unitOfWork.states.all().then(() => {
            states.connect();
        });

        this.unitOfWork.addressTypes.all().then(data => {
            this.addressTypes = sortBy(data, x => x.displayName);
        });

        this.unitOfWork.phoneNumberTypes.all().then(data => {
            this.phoneNumberTypes = sortBy(data, x => x.name);
        });
    }

    ngOnDestroy() {
        this.onDestroy.next();
    }

    addStateToList() {
        let state = <State> {
            id: 'PR',
            shortName: 'PR',
            name: "Puerto Rico",
            rowVersion: 0
        };
        this.unitOfWork.stateFactory.create(state);
    }

    addPhoneNumber(type: PhoneNumberType) {
        this.model.addPhoneNumber(type.id);
    }

    deletePhoneNumber(phoneNumber: PhoneNumber) {
        if (phoneNumber.primary || this.model.phoneNumbers.length === 1) return;

        this.model.deletePhoneNumber(phoneNumber);
    }

    setPrimaryPhoneNumber(phoneNumber: PhoneNumber) {
        if (phoneNumber.primary) return;

        this.model.setPrimaryPhoneNumber(phoneNumber);
    }

    addAddress(type: AddressType) {
        this.model.addAddress(type.id);
    }

    deleteAddress(address: Address) {
        if (address.primary || this.model.addresses.length === 1) return;

        this.model.deleteAddress(address);
    }

    setPrimaryAddress(address: Address) {
        if (address.primary) return;

        this.model.setPrimaryAddress(address);
    }
}