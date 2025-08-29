def test_imports():
    try:
        from app import create_app
        print("✓ Importação da aplicação funcionando")
        
        app = create_app()
        print("✓ Criação da aplicação funcionando")
        
        # Testa se as rotas estão registradas
        routes = [rule.rule for rule in app.url_map.iter_rules()]
        print(f"✓ {len(routes)} rotas registradas")
        
        return True
        
    except Exception as e:
        print(f"✗ Erro na importação: {e}")
        return False

if __name__ == "__main__":
    print("Testando aplicação Flask...")
    success = test_imports()
    
    if success:
        print("\n🎉 Aplicação funcionando corretamente!")
        print("Para executar: python app/run.py")
    else:
        print("\n❌ Erro na aplicação. Verifique os logs acima.")
