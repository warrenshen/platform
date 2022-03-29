CREATE TRIGGER create_full_name BEFORE INSERT OR UPDATE 
ON public.users 
FOR EACH ROW EXECUTE FUNCTION public.create_full_name();
