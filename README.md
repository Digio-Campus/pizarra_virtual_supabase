# Pizarra virtual con Angular y Supabase

Pequeño proyecto en el que se ha desarrollado una pizarra virtual en Angular haciendo uso de la funcionalidad "Realtime" de Supabase.

Los usuarios son capaces de iniciar sesión a traves de un "Magic Link" o una cuenta de GitHub.

Los usuarios son capaces de dibujar en tiempo real, tambien se recoge el movimiento del cursor de cada usuario.

## Instalación

>**Requires [Angular 17.1.0](https://angular.io/)**
>
>**Requires [Supabase](https://supabase.com/)**


Después de clonar el repositorio instalamos las dependencias necesarias:
```bash
npm install
```

Creamos la siguiente tabla en Supabase:
```sql
create table
  public.profiles (
    id uuid not null,
    updated_at timestamp with time zone null,
    username text null,
    full_name text null,
    avatar_url text null,
    website text null,
    color_picker text null,
    constraint profiles_pkey primary key (id),
    constraint profiles_username_key unique (username),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint username_length check ((char_length(username) >= 3))
  ) tablespace pg_default;
```

Iniciamos el servidor
```bash
ng serve
```

## Uso
Accedemos al servidor web e iniciamos sesión, a continuación se le da la posiblidad al usuario de escoger un color de cursor y un nombre de usuario que se mostrara junto a este en la pizarra. Al pulsar el boton "Entrar en la sala" el usuario accede a la pizarra virtual, cada trazo dibujado por el usuario sera visto en tiempo real por todos los usuarios dentro de la sala en ese momento.