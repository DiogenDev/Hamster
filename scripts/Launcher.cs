using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

class Program {
    [STAThread]
    static void Main() {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string targetExe = Path.Combine(baseDir, "HamsterDiogen-Windows", "HamsterDiogen.exe");
        if (File.Exists(targetExe)) {
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = targetExe;
            psi.WorkingDirectory = Path.GetDirectoryName(targetExe);
            Process.Start(psi);
        } else {
            MessageBox.Show(
                "Файл не найден:\n" + targetExe + "\n\nПожалуйста, запустите сборку приложения (build-windows.ps1).",
                "Хомячок Диоген",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning
            );
        }
    }
}
