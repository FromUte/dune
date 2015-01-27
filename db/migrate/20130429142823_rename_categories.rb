class RenameCategories < ActiveRecord::Migration
  def up
    execute "
    UPDATE categories SET name_fr = 'Gastronomie', name_en = 'Gastronomy' WHERE name_fr = 'Comida';
    UPDATE categories SET name_fr = 'Technologie', name_en = 'Science & Technology' WHERE name_fr = 'Tecnologia';
    "
  end

  def down
  end
end
