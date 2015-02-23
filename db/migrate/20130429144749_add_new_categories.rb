class AddNewCategories < ActiveRecord::Migration
  def up
    execute "
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Mobilidade e Transporte', 'Mobility & Transportation', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Meio Ambiente', 'Environment', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Negócios Sociais', 'Social Business', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Educação', 'Education', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Filmes de Ficção', 'Fiction Films', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Filmes Documentários', 'Documentary Films', now(), now());
    INSERT INTO categories (name_fr, name_en, created_at, updated_at) VALUES ('Filmes Universitários', 'Experimental Films', now(), now());
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
