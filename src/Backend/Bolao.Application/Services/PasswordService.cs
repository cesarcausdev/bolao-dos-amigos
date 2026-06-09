using System.Security.Cryptography;
using System.Text;
using Bolao.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Bolao.Application.Services;

public class PasswordService : IPasswordService
{
    private readonly byte[] _key;

    public PasswordService(IConfiguration config)
    {
        var rawKey = config["Encryption:Key"]
            ?? throw new InvalidOperationException("Encryption:Key não configurado.");
        using var sha = SHA256.Create();
        _key = sha.ComputeHash(Encoding.UTF8.GetBytes(rawKey));
    }

    public string Encrypt(string plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();
        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plaintext);
        var encrypted = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        // Prepend IV (16 bytes) to the ciphertext
        var result = new byte[aes.IV.Length + encrypted.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(encrypted, 0, result, aes.IV.Length, encrypted.Length);
        return Convert.ToBase64String(result);
    }

    public string Decrypt(string ciphertext)
    {
        var fullBytes = Convert.FromBase64String(ciphertext);
        using var aes = Aes.Create();
        aes.Key = _key;
        var ivSize = aes.BlockSize / 8; // 16 bytes
        var iv = new byte[ivSize];
        var cipher = new byte[fullBytes.Length - ivSize];
        Buffer.BlockCopy(fullBytes, 0, iv, 0, ivSize);
        Buffer.BlockCopy(fullBytes, ivSize, cipher, 0, cipher.Length);
        aes.IV = iv;
        using var decryptor = aes.CreateDecryptor();
        var decrypted = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
        return Encoding.UTF8.GetString(decrypted);
    }
}
