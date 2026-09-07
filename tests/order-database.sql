-- All fixtures and catalog edits are rolled back; no test orders persist.
begin;
do $$
declare p jsonb; a uuid; b uuid; k uuid := gen_random_uuid(); old_name text;
begin
 update public.products set order_status='available' where id in (1,2);
 p := jsonb_build_object('customerName','MYNORA transaction test','phone','0900000000','preferredContactChannel','phone','items',jsonb_build_array(jsonb_build_object('productId','1','quantity',1)),'requestedDate','2030-01-01','requestedTimeSlot','14:00–16:00','fulfillmentType','pickup','deliveryAddress','','differentRecipient',false,'recipientName','','recipientPhone','','note','','consent',true,'website','');
 a := public.submit_cake_order(k,p);
 if a <> public.submit_cake_order(k,p) then raise exception 'Deduplication failed'; end if;
 if (select count(*) from public.cake_order_notifications where order_id=a)<>1 then raise exception 'Outbox missing'; end if;
 begin perform public.submit_cake_order(k,p||'{"note":"changed"}');raise exception 'Expected conflict'; exception when others then if sqlerrm<>'IDEMPOTENCY_CONFLICT' then raise;end if;end;
 select items->0->>'productNameSnapshot' into old_name from public.cake_order_requests where id=a;
 update public.products set display_name='Changed after snapshot' where id=1;
 if (select items->0->>'productNameSnapshot' from public.cake_order_requests where id=a)<>old_name then raise exception 'Snapshot changed';end if;
 p:=p||jsonb_build_object('fulfillmentType','delivery','deliveryAddress','Test address','items',jsonb_build_array(jsonb_build_object('productId','1','quantity',2),jsonb_build_object('productId','2','quantity',3)));
 b:=public.submit_cake_order(gen_random_uuid(),p);
 if (select jsonb_array_length(items) from public.cake_order_requests where id=b)<>2 then raise exception 'Multi item failed';end if;
 if not public.claim_cake_notification(a) or public.claim_cake_notification(a) then raise exception 'Notification lock failed';end if;
 update public.cake_order_notifications set status='failed',last_error='EMAIL_PROVIDER_503' where order_id=a;
 if not exists(select 1 from public.cake_order_requests where id=a) then raise exception 'Email error lost order';end if;
 update public.products set content_status='hidden' where id=1;
 begin perform public.submit_cake_order(gen_random_uuid(),p);raise exception 'Expected hidden rejection';exception when others then if sqlerrm<>'PRODUCT_UNAVAILABLE' then raise;end if;end;
 update public.products set content_status='safe_draft',order_status='sold_out' where id=1;
 begin perform public.submit_cake_order(gen_random_uuid(),p);raise exception 'Expected sold out rejection';exception when others then if sqlerrm<>'PRODUCT_UNAVAILABLE' then raise;end if;end;
 update public.products set order_status='available' where id=1;
 perform public.submit_cake_order(gen_random_uuid(),p);perform public.submit_cake_order(gen_random_uuid(),p);perform public.submit_cake_order(gen_random_uuid(),p);
 begin perform public.submit_cake_order(gen_random_uuid(),p);raise exception 'Expected rate limit';exception when others then if sqlerrm<>'RATE_LIMIT' then raise;end if;end;
 if has_table_privilege('anon','public.cake_order_requests','SELECT') or has_function_privilege('anon','public.submit_cake_order(uuid,jsonb)','EXECUTE') then raise exception 'Public privilege leak';end if;
end $$;
rollback;
select 'PASS: snapshots, pickup, delivery, duplicate/conflict, outbox locking, provider failure persistence, hidden, sold out, rate limit, access isolation' as test_result;
