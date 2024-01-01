using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Main : MonoBehaviour
{
    public GameObject cursor;

    private Vector3 worldPosition;

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Cursor position: " + cursor.transform.position.x + " - "+ cursor.transform.position);
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Vector3 mousePos = Input.mousePosition;
            {
                worldPosition = Camera.main.ScreenToWorldPoint(mousePos);

                Debug.Log("Mouse click in word spacec: (x : " + worldPosition.x + " z: "+worldPosition.z);

                this.cursor.transform.position = new Vector3(worldPosition.x, 0, worldPosition.z);

            }
        }
    }
}
