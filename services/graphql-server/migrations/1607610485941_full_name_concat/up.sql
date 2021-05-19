CREATE FUNCTION public.create_full_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.full_name = CONCAT_WS(' ', NEW.first_name, NEW.last_name);
    return NEW;
END;
$$;
