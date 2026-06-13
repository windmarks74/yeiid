package com.yei.idphoto;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.OutputStream;

/**
 * 완성 사진을 공용 갤러리(Pictures/<album>)에 저장한다.
 * @capacitor-community/media 는 앱 전용 폴더(Android/media/<pkg>)에 저장해 앱 삭제 시 사진이 사라진다.
 * 여기서는 MediaStore 공용 컬렉션에 기록 → 앱을 삭제해도 사진이 갤러리에 남고, 정식 앨범으로 노출된다.
 *  - API 29+(Q): RELATIVE_PATH 사용, 권한 불필요(스코프드 스토리지).
 *  - API 24~28: WRITE_EXTERNAL_STORAGE 런타임 권한 필요.
 */
@CapacitorPlugin(
    name = "GallerySave",
    permissions = {
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "storage")
    }
)
public class GallerySavePlugin extends Plugin {

    @PluginMethod
    public void saveImage(PluginCall call) {
        // API 28 이하에서만 저장 권한 필요 (29+는 스코프드 스토리지로 불필요)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermCallback");
            return;
        }
        doSave(call);
    }

    @PermissionCallback
    private void storagePermCallback(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            doSave(call);
        } else {
            call.reject("사진 저장 권한이 거부되었습니다.");
        }
    }

    private void doSave(PluginCall call) {
        final String data = call.getString("data");
        if (data == null) {
            call.reject("저장할 이미지가 없습니다.");
            return;
        }
        final String album = call.getString("album", "Yei");
        String name = call.getString("fileName", "Yei");
        if (!name.toLowerCase().endsWith(".jpg") && !name.toLowerCase().endsWith(".jpeg")) {
            name = name + ".jpg";
        }
        final String displayName = name;

        new Thread(() -> {
            try {
                // data URL(data:image/jpeg;base64,...) 또는 순수 base64 모두 허용
                int comma = data.indexOf(',');
                String b64 = data.startsWith("data:") && comma >= 0 ? data.substring(comma + 1) : data;
                byte[] bytes = Base64.decode(b64, Base64.DEFAULT);

                ContentResolver resolver = getContext().getContentResolver();
                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, displayName);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");

                Uri collection;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(MediaStore.Images.Media.RELATIVE_PATH,
                            Environment.DIRECTORY_PICTURES + "/" + album);
                    values.put(MediaStore.Images.Media.IS_PENDING, 1);
                    collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                } else {
                    File dir = new File(
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), album);
                    if (!dir.exists() && !dir.mkdirs()) {
                        call.reject("앨범 폴더를 만들 수 없습니다.");
                        return;
                    }
                    values.put(MediaStore.Images.Media.DATA, new File(dir, displayName).getAbsolutePath());
                    collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                }

                Uri item = resolver.insert(collection, values);
                if (item == null) {
                    call.reject("갤러리에 항목을 만들 수 없습니다.");
                    return;
                }

                try (OutputStream os = resolver.openOutputStream(item)) {
                    if (os == null) throw new Exception("출력 스트림을 열 수 없습니다.");
                    os.write(bytes);
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear();
                    values.put(MediaStore.Images.Media.IS_PENDING, 0);
                    resolver.update(item, values, null, null);
                }

                JSObject ret = new JSObject();
                ret.put("uri", item.toString());
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("저장 실패: " + e.getMessage());
            }
        }).start();
    }
}
