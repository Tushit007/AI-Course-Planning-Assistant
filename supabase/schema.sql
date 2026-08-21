create table if not exists courses (
    id uuid primary key default gen_random_uuid(),

    title text not null,

    subject text not null,

    target_audience text,

    duration_and_frequency text,

    learning_goals text,

    modules jsonb default '[]'::jsonb,

    status text default 'draft',

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);