-- Initial version: 1.0.0
-- Date: 2024-03-18
-- Author: Matheus Lima da Cruz

-- Create the extension 'uuid-ossp' if not exists
create extension if not exists "uuid-ossp";

-- Create the schema 'point' if not exists
create schema if not exists point;

-- Create the table 'roles'
create table if not exists point.roles (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) unique not null,
    description text,
    created_at timestamp default current_timestamp
);
create index if not exists idx_roles_name on point.roles (name);

-- Create the table 'departments'
create table if not exists point.departments (
    name varchar(100) primary key not null,
    responsible uuid references point.roles(id) not null,
    created_at timestamp default current_timestamp
);

-- Create the table 'department_roles'
create table department_roles(
    department VARCHAR references point.departments(name) not null,
    role_id uuid references point.roles(id) not null,
    primary key (department, role_id)
);

-- Create the table 'work_schedules'
create table if not exists point.work_schedules(
    name VARCHAR(100) primary key not null,
    start_time time not null,
    end_time time not null,
    lunch_duration time,
    created_at timestamp default current_timestamp
);
create index if not exists idx_work_schedules_start_time on point.work_schedules (start_time);
create index if not exists idx_work_schedules_end_time on point.work_schedules (end_time);

-- Create the type permission
create type point.permission as enum ('Normal', 'RH', 'Admin');

-- Create the table 'permissions'
create table if not exists point.permissions (
    name point.permission primary key not null,
    can_manage_users boolean default false,
    can_manage_departments boolean default false,
    can_manage_work_schedules boolean default false,
    can_manage_roles boolean default false,
    can_manage_permissions boolean default false,
    can_approve_absences boolean default false,
    can_generate_reports boolean default false,
    can_view_all_time_records boolean default false,
    can_manage_device boolean default false,
    can_manage_company boolean default false,
    created_at timestamp default current_timestamp
);

-- Insert the default permissions
insert into point.permissions(name, can_view_all_time_records) values ('Normal', TRUE);
insert into point.permissions(name, can_manage_users, can_manage_departments, can_manage_work_schedules, can_manage_roles, can_approve_absences, can_generate_reports, can_view_all_time_records) values ('RH', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);
insert into point.permissions(name, can_manage_users, can_manage_departments, can_manage_work_schedules,can_manage_roles, can_manage_permissions, can_approve_absences, can_generate_reports, can_view_all_time_records, can_manage_device, can_manage_company) values ('Admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Create the type gender
create type point.gender as enum ('Masculino', 'Feminino', 'Outro');

-- Create the table 'employees'
create table if not exists point.employees(
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    password varchar(255) not null,
    cpf varchar(11) unique not null,
    pis varchar(11) unique not null,
    pin varchar(6) not null,
    gender point.gender not null default 'Outro',
    birth_date date not null,
    role_id uuid references point.roles(id) not null,
    work_schedule varchar references point.work_schedules(name) not null,
    hiring_date date not null,
    permission point.permission references point.permissions(name) default 'Normal' not null,
    active boolean default true,
    created_at timestamp default current_timestamp
);
create index if not exists idx_cpf on point.employees (cpf);
create index if not exists idx_active on point.employees (active);
create index if not exists idx_permission on point.permissions (name);
create index if not exists idx_role on point.roles (name);
create index if not exists idx_work_schedule on point.work_schedules (name);

-- Create the table 'login'
create table if not exists login (
    id uuid primary key references point.employees(id) not null,
    token varchar(500) unique not null,
    expires_at date not null,
    created_at timestamp default current_timestamp
);
create index if not exists idx_token on login (token);

-- Create the table 'time_records'
create table if not exists point.time_records(
    id uuid primary key default uuid_generate_v4(),
    employee uuid references point.employees(id) not null,
    record timestamp not null,
    location POINT,
    created_at timestamp default current_timestamp
);
create index if not exists idx_record on point.time_records (record);

-- Create the table 'justifications'
create table if not exists point.justifications(
    id uuid primary key default uuid_generate_v4(),
    employee uuid references point.employees(id) not null,
    justification text not null,
    justification_date date not null,
    created_at timestamp default current_timestamp
);

-- Create the table 'justification_time_records'
create table if not exists point.justification_time_records(
    justification uuid references point.justifications(id) not null,
    time_record uuid references point.time_records(id) not null,
    primary key (justification, time_record)
);

-- Create the table 'devices'
create table if not exists point.devices(
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    ip_address varchar(15) not null,
    created_at timestamp default current_timestamp
);

-- Create the table 'company'
create table if not exists point.company(
    name varchar(100) primary key not null,
    cnpj varchar(14) unique not null,
    address varchar(255) not null,
    logo BYTEA,
    certificate Text not null,
    created_at timestamp default current_timestamp
);