class AddNewCategories < ActiveRecord::Migration
  def up
    execute "
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Mobilité et transport', 'Mobility & Transportation', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Environnement', 'Environment', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Sociale', 'Social Business', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Education', 'Education', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Films de Fiction', 'Fiction Films', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Films Documentaire', 'Documentary Films', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Films Universitaire', 'Experimental Films', now(), now());
    "
  end

  def down
    execute "
    DELETE FROM categories WHERE name_fr = 'Mobilidade e Transporte';
    DELETE FROM categories WHERE name_fr = 'Meio Ambiente';
    DELETE FROM categories WHERE name_fr = 'Negócios Sociais';
    DELETE FROM categories WHERE name_fr = 'Educação';
    DELETE FROM categories WHERE name_fr = 'Filmes de Ficção';
    DELETE FROM categories WHERE name_fr = 'Filmes Documentários';
    DELETE FROM categories WHERE name_fr = 'Filmes Universitários';
    "
  end
end
