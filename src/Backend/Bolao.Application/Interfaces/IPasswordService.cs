namespace Bolao.Application.Interfaces;

public interface IPasswordService
{
    string Encrypt(string plaintext);
    string Decrypt(string ciphertext);
}
