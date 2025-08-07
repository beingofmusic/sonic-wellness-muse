-- Add missing RLS policies for wellness_practices table
CREATE POLICY "Team members and admins can create wellness practices" 
ON public.wellness_practices 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));

CREATE POLICY "Team members and admins can update wellness practices" 
ON public.wellness_practices 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));

CREATE POLICY "Team members and admins can delete wellness practices" 
ON public.wellness_practices 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));

-- Add missing RLS policies for journal_prompts table
CREATE POLICY "Team members and admins can create journal prompts" 
ON public.journal_prompts 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));

CREATE POLICY "Team members and admins can update journal prompts" 
ON public.journal_prompts 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));

CREATE POLICY "Team members and admins can delete journal prompts" 
ON public.journal_prompts 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role = 'admin'::user_role) OR (profiles.role = 'team'::user_role)))));