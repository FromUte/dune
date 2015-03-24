class AddNewCategories < ActiveRecord::Migration
  def up
    execute "
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Particulier', 'Particulier', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Chef d''entreprise', 'Chef d''entreprise', now(), now());
    "
  end

  def down
    execute "
    DELETE FROM categories WHERE name_fr = 'Particulier';
    DELETE FROM categories WHERE name_fr = 'Chef d'entreprise';
    "
  end
end
