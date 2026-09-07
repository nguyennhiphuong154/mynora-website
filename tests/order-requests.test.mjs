import assert from 'node:assert/strict';
import test from 'node:test';
import {validateOrder,minimumDate,orderEmail} from '../supabase/functions/_shared/order.ts';
import {resendProvider} from '../supabase/functions/_shared/notification.ts';
const valid=()=>({customerName:'Khách kiểm thử',phone:'0900000000',preferredContactChannel:'phone',items:[{productId:'1',quantity:1}],requestedDate:minimumDate(),requestedTimeSlot:'14:00–16:00',fulfillmentType:'pickup',deliveryAddress:'',differentRecipient:false,recipientName:'',recipientPhone:'',note:'',consent:true,website:''});
test('pickup with one cake and delivery with multiple quantities validate',()=>{
 assert.ok(validateOrder(valid()).data);
 assert.ok(validateOrder({...valid(),fulfillmentType:'delivery',deliveryAddress:'Địa chỉ kiểm thử Đà Nẵng',items:[{productId:'1',quantity:2},{productId:'2',quantity:3}]}).data);
});
test('required fields, consent, quantities, date, duplicate products and invalid variants rejected',()=>{
 for(const change of [{phone:''},{customerName:''},{consent:false},{items:[]},{requestedDate:'2020-01-01'},{requestedDate:'2030-02-30'},{fulfillmentType:'delivery'},{items:[{productId:'1',quantity:0}]},{items:[{productId:'1',quantity:1},{productId:'1',quantity:2}]},{items:[{productId:'1',quantity:1,variantId:'made-up'}]},{website:'bot'},{differentRecipient:true}]) assert.equal(validateOrder({...valid(),...change}).data,undefined,JSON.stringify(change));
});
test('Vietnam date handles midnight and 5-day preorder requirement',()=>assert.equal(minimumDate(new Date('2026-09-07T18:00:00Z')),'2026-09-13'));
test('irrelevant hidden recipient and address values are removed server-side',()=>{
 const result=validateOrder({...valid(),deliveryAddress:'old',recipientName:'old',recipientPhone:'old'}).data;
 assert.equal(result.deliveryAddress,'');assert.equal(result.recipientName,'');
});
test('email includes saved snapshot and delivery/recipient details',()=>{
 const order={id:'real-uuid',created_at:'2026-09-07',payload:{...valid(),differentRecipient:true,recipientName:'Người nhận',recipientPhone:'0911111111',fulfillmentType:'delivery',deliveryAddress:'Đà Nẵng',note:'Nhắn trước khi giao'},items:[{productId:'1',productNameSnapshot:'Tên bánh tại lúc đặt',quantity:3}]};
 const {text,subject}=orderEmail(order);
 for(const value of ['MYN-real-uuid','Tên bánh tại lúc đặt × 3','Người nhận','0911111111','Đà Nẵng','Nhắn trước khi giao','Chờ MYNORA xác nhận'])assert.ok(text.includes(value));
 assert.ok(subject.includes('Khách kiểm thử'));
});
test('email configuration failure is explicit',async()=>{
 await assert.rejects(()=>resendProvider(()=>undefined).send({id:'id',payload:valid(),items:[],created_at:''}),/EMAIL_NOT_CONFIGURED/);
});
test('provider failure is retryable, request id supplies provider deduplication',async()=>{
 const original=globalThis.fetch;let headers;
 globalThis.fetch=async(_,options)=>{headers=options.headers;return new Response('',{status:503});};
 try{await assert.rejects(()=>resendProvider(k=>({RESEND_API_KEY:'test',ORDER_NOTIFICATION_FROM:'test@example.com',ORDER_NOTIFICATION_EMAIL:'owner@example.com'})[k]).send({id:'saved-id',payload:valid(),items:[],created_at:''}),/EMAIL_PROVIDER_503/);assert.equal(headers['Idempotency-Key'],'cake-order-saved-id');}finally{globalThis.fetch=original;}
});
