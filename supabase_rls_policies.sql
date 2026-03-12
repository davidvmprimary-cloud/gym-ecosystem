-- Archivo SQL para habilitar Row Level Security (RLS) en Supabase para GymTracker

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Split" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Set" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NutritionLog" ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas para la tabla "User"
-- Un usuario solo puede ver y modificar su propio registro
CREATE POLICY "Users can view their own profile." ON "User" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON "User" FOR UPDATE USING (auth.uid() = id);
-- Insertar el registro (normalmente ocurre vía trigger de auth o Prisma en el signup)
CREATE POLICY "Users can insert their own profile." ON "User" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile." ON "User" FOR DELETE USING (auth.uid() = id);

-- 3. Crear políticas para la tabla "Split"
CREATE POLICY "Users can manage their own splits."
ON "Split" FOR ALL USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- 4. Crear políticas para la tabla "Exercise"
-- Un usuario administra ejercicios pertenecientes a sus propios splits
CREATE POLICY "Users can manage their own exercises."
ON "Exercise" FOR ALL
USING (EXISTS (SELECT 1 FROM "Split" WHERE "Split".id = "Exercise"."splitId" AND "Split"."userId" = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM "Split" WHERE "Split".id = "Exercise"."splitId" AND "Split"."userId" = auth.uid()));

-- 5. Crear políticas para la tabla "Session"
CREATE POLICY "Users can manage their own sessions."
ON "Session" FOR ALL USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");

-- 6. Crear políticas para la tabla "Set"
-- Un usuario administra sets de sesiones que le pertenecen
CREATE POLICY "Users can manage their own sets."
ON "Set" FOR ALL
USING (EXISTS (SELECT 1 FROM "Session" WHERE "Session".id = "Set"."sessionId" AND "Session"."userId" = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM "Session" WHERE "Session".id = "Set"."sessionId" AND "Session"."userId" = auth.uid()));

-- 7. Crear políticas para "NutritionLog"
CREATE POLICY "Users can manage their own nutrition logs."
ON "NutritionLog" FOR ALL USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");
