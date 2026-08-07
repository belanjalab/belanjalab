-- Core SEO categories for BelanjaLab.
-- Safe to run more than once: existing slugs are left untouched.

insert into public.categories (name, slug)
select 'Gadget', 'gadget'
where not exists (
  select 1 from public.categories where slug = 'gadget'
);

insert into public.categories (name, slug)
select 'Elektronik', 'elektronik'
where not exists (
  select 1 from public.categories where slug = 'elektronik'
);

insert into public.categories (name, slug)
select 'Rumah Tangga', 'rumah-tangga'
where not exists (
  select 1 from public.categories where slug = 'rumah-tangga'
);

insert into public.categories (name, slug)
select 'Gaming', 'gaming'
where not exists (
  select 1 from public.categories where slug = 'gaming'
);
