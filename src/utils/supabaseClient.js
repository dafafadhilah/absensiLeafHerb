import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kgowbsrxersiwphbbhdc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb3dic3J4ZXJzaXdwaGJiaGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODQ1NjksImV4cCI6MjA1ODY2MDU2OX0.7X3sjZLrnwoJm14wwIsJ2xWs88vRtKSxgToWcwZSqtM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
