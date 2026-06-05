INSERT INTO user_goals (kcal_goal, protein_goal, carbs_goal, fat_goal, water_goal_ml)
VALUES (2000, 150, 200, 65, 2500);

INSERT INTO food_cache (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
VALUES
  -- breakfast
  ('Aveia', 'breakfast', 389, 17, 66, 7),
  ('Ovo inteiro', 'breakfast', 155, 13, 1.1, 11),
  ('Pão integral', 'breakfast', 247, 9, 44, 3.4),
  ('Iogurte grego', 'breakfast', 59, 10, 3.6, 0.4),
  ('Manteiga de amendoim', 'breakfast', 588, 25, 20, 50),
  ('Tapioca', 'breakfast', 358, 0.2, 88, 0.1),
  ('Leite desnatado', 'breakfast', 35, 3.4, 5, 0.1),
  ('Banana', 'breakfast', 89, 1.1, 23, 0.3),
  -- lunch
  ('Frango grelhado', 'lunch', 165, 31, 0, 3.6),
  ('Arroz branco cozido', 'lunch', 130, 2.7, 28, 0.3),
  ('Feijão cozido', 'lunch', 77, 4.8, 14, 0.5),
  ('Batata doce cozida', 'lunch', 86, 1.6, 20, 0.1),
  ('Patinho moído', 'lunch', 150, 28, 0, 4),
  ('Sobrecoxa frango', 'lunch', 181, 26, 0, 8.5),
  ('Brócolis cozido', 'lunch', 35, 2.4, 7, 0.4),
  ('Azeite de oliva', 'lunch', 884, 0, 0, 100),
  -- snack
  ('Whey protein', 'snack', 370, 80, 8, 4),
  ('Maçã', 'snack', 52, 0.3, 14, 0.2),
  ('Queijo cottage', 'snack', 98, 11, 3.4, 4.3),
  -- dinner
  ('Salmão grelhado', 'dinner', 208, 28, 0, 10);
