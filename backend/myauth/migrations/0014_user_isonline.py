# Generated by Django 4.2.16 on 2024-11-27 21:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myauth', '0013_user_external_avatar_alter_user_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='isOnline',
            field=models.BooleanField(default=False),
        ),
    ]
