/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * @author Jonatan Gall 
 */

/* global getAssetRegistry getFactory emit */

/**
 * Sample transaction processor function.
 * @param {org.example.hyperiot.registerThirdPartServiceOnDevice} tx
 * @transaction
 */
async function registerThirdPartServiceOnDevice(tx) {  // eslint-disable-line no-unused-vars

    if(tx.owner !=  tx.device.owner){
        throw new Error('Owner not registered on this device')
    }
    
    const allowedUsers = tx.device.allowedUsers;
    if(allowedUsers.find((allowedUser) => allowedUser.thirdPartServiceId == tx.thirdPartService.thirdPartServiceId)){
        throw new Error('Third Party Service already been registered on this device')
    }
    try{
        tx.device.allowedUsers.push(tx.thirdPartService);
    }catch(e) {
        throw new Error('Cannot add users on this device ==> ', e);
    }
    let assetRegistry = await getAssetRegistry('org.example.hyperiot.Device');
    await assetRegistry.update(tx.device);
}
/**
 * Transaction remove a third part services from allowed services on device array participant
 * @param {org.example.hyperiot.removeThirdPartServiceOnDevice} tx
 * @transaction
 */
async function removeThirdPartServiceOnDevice(tx) {  // eslint-disable-line no-unused-vars

    if(tx.owner !=  tx.device.owner){
        throw new Error('Owner not registered on this device')
    }
    
    const allowedUsers = tx.device.allowedUsers;
    if(!allowedUsers.find((allowedUser) => allowedUser.thirdPartServiceId == tx.thirdPartService.thirdPartServiceId)){
        throw new Error('Third Party Service is not registered on this device')
    }
    try{
        tx.device.allowedUsers = allowedUsers.filter((el) => el.thirdPartServiceId != tx.thirdPartService.thirdPartServiceId);
    }catch(e) {
        throw new Error('Cannot add users on this device ==> ', e);
    }

    let assetRegistry = await getAssetRegistry('org.example.hyperiot.Device');
    await assetRegistry.update(tx.device);
}
/**
 * Transaction grant access to allowed Third Part Users
 * @param {org.example.hyperiot.grantThirdPartServicePermitionOnDevice} tx
 * @transaction
 */
async function grantThirdPartServicePermitionOnDevice(tx) {  // eslint-disable-line no-unused-vars
    const allowedUsers = tx.device.allowedUsers;
    let access = false
    if(allowedUsers.includes(tx.thirdPartService)){
        access = true;
    }
    // Emit an event asset.
    let event = getFactory().newEvent('org.example.hyperiot', 'AccessEvent');
    event.thirdPartService = tx.thirdPartService
    event.device = tx.device;
    event.access = access;
    emit(event);
}