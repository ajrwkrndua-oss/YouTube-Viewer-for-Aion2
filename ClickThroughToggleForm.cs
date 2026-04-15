namespace YouTubeOverlay;

public sealed class ClickThroughToggleForm : Form
{
    private readonly OverlayForm overlayForm;
    private readonly Button disableButton;

    public ClickThroughToggleForm(OverlayForm overlayForm)
    {
        this.overlayForm = overlayForm;

        Text = "\uD1B5\uACFC \uB04C\uAE30";
        FormBorderStyle = FormBorderStyle.FixedToolWindow;
        StartPosition = FormStartPosition.Manual;
        ShowInTaskbar = false;
        TopMost = true;
        Size = new Size(120, 56);
        MaximizeBox = false;
        MinimizeBox = false;
        BackColor = Color.FromArgb(28, 31, 38);

        disableButton = new Button
        {
            Dock = DockStyle.Fill,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(192, 57, 43),
            ForeColor = Color.White,
            Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold),
            Text = "\uD1B5\uACFC \uB04C\uAE30"
        };
        disableButton.FlatAppearance.BorderSize = 0;
        disableButton.Click += (_, _) => overlayForm.DisableClickThroughFromFloatingButton();

        Controls.Add(disableButton);
    }
}
